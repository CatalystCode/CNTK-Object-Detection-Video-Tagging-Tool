import { crc32c, maskCrc, getInt64Buffer, getInt32Buffer } from "./tensorFlowHelpers";

describe("TFRecords Helper Functions", () => {
    describe("Run getInt64Buffer method test", () => {
        it("Check getInt64Buffer for number 164865", async () => {
            expect(getInt64Buffer(164865)).toEqual(new Buffer([1, 132, 2, 0, 0, 0, 0, 0]));
        });
    });

    describe("Run getInt32Buffer method test", () => {
        it("Check getInt32Buffer for number 164865", async () => {
            expect(getInt32Buffer(164865)).toEqual(new Buffer([1, 132, 2, 0]));
        });
    });

    describe("Run crc32c method test", () => {
        it("Check crc32c for number 164865", async () => {
            expect(crc32c(new Buffer([1, 132, 2, 0, 0, 0, 0, 0]))).toEqual(1310106699);
        });
    });

    describe("Run maskCrc method test", () => {
        it("Check maskCrc for crc 1310106699", async () => {
            expect(maskCrc(1310106699)).toEqual(3944318725);
        });
    });

    describe("Run integration of getInt32Buffer(maskCrc(crc32c(getInt64Buffer())) methods test", () => {
        it("Check maskCrc for for number 164865", async () => {
            expect(getInt32Buffer(maskCrc(crc32c(getInt64Buffer(164865)))))
                .toEqual(new Buffer([5, 135, 25, 235]));
        });
    });
});
