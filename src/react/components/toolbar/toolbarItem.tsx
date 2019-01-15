import React from "react";
import { IProject } from "../../../models/applicationState";
import IProjectActions from "../../../redux/actions/projectActions";

/**
 * Toolbar Item Metadata
 * @member name - Name of Toolbar Item
 * @member icon - Icon for toolbar item
 * @member tooltip - Tooltip to apply upon selection
 * @member group - Name of item group in which to include item
 * @member type - Type of toolbar item (Action or State) 
 */
export interface IToolbarItemMetadata {
    name: string;
    icon: string;
    tooltip: string;
    group: string;
    type: ToolbarItemType;
}

/**
 * Types of Toolbar items
 * @member Action - Toolbar item executes an action (export)
 * @member State - Toolbar item changes something about the state of the component (Draw Polygon)
 */
export enum ToolbarItemType {
    Action = 0,
    State = 1,
}

/**
 * Properties for Toolbar Item
 * @member actions - Project actions
 * @member project - Current project being edited
 * @member active - Toolbar is active
 * @member onClick - Function to be called on click of Toolbar Item
 */
export interface IToolbarItemProps extends IToolbarItemMetadata {
    actions: IProjectActions;
    project: IProject;
    active: boolean;
    onClick: (item: ToolbarItem) => void;
}

/**
 * @name - Toolbar Item
 * @description - Controls for Editor Page Toolbar
 */
export abstract class ToolbarItem extends React.Component<IToolbarItemProps> {
    constructor(props, context) {
        super(props, context);

        this.onItemClick = this.onItemClick.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const className = ["toolbar-btn"];
        if (this.props.active) {
            className.push("active");
        }

        return (
            <button type="button"
                className={className.join(" ")}
                title={this.props.tooltip}
                onClick={this.onClick}>
                <i className={"fas " + this.props.icon} />
            </button>
        );
    }

    protected abstract onItemClick();

    private onClick() {
        this.onItemClick();
        this.props.onClick(this);
    }
}
