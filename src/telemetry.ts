import { Env } from "./common/environment";
import { reactAI } from "react-appinsights";
import history from "./history";
import { ApplicationInsights, SeverityLevel } from "@microsoft/applicationinsights-web";
import { version } from "../package.json";
import { isElectron } from "./common/hostProcess";
import { Action } from "redux";
import { IAppError } from "./models/applicationState";
import { config } from "dotenv";

// vott-app-insights
config();
const instrumentationKey = process.env.REACT_APP_INSTRUMENTATION_KEY;

let debug = false;
let maxBatchSize = 250;

if (Env.get() !== "production") {
    // for development/testing
    // myho-appinsights
    debug = true;
    maxBatchSize = 0;  // send telemetry as soon as it's collected
}

let appInsights;

export function setUpAppInsights() {
    if (isElectron()) {
        return;
    }

    reactAI.setContext({
        AppVersion: version,
    });

    const config = {
        instrumentationKey,
        maxBatchSize,
        extensions: [reactAI],
        extensionConfig: {
            [reactAI.extensionId]: {
                debug,
                history,  // required for tracking router changes
            },
        },
    };

    appInsights = new ApplicationInsights({config});
    appInsights.loadAppInsights();
}

export function trackError(appError: IAppError): void {
    if (isElectron()) {
        return;
    }

    const error = new Error(appError.errorCode.toString());
    appInsights.trackException({
        error,
        properties: {
            message: appError.message,
        },
        severityLevel: SeverityLevel.Error,
    });
}

export function trackReduxAction(action: Action): void {
    if (isElectron()) {
        return;
    }

    appInsights.trackEvent({
        name: action.type,
    });
}
