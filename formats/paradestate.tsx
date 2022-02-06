import { DictFormat } from "../pages/api/deliverables/parade-state/generate";
import { Text, Link, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { RefObject } from "react";
import React from "react";

const ParadeStateFormat = React.forwardRef<
    HTMLDivElement,
    { data: DictFormat }
>(({ data }, ref) => {
    return (
        <Box ref={ref}>
            <Text as="div">
                *{data["PLATOON-NAME"]} PARADE STATE AS OF{" "}
                {data["SELECTED-DATE"]} 0800HRS*
            </Text>
            <Text as="div">
                Total: {data["TOTAL-PRESENT"]}/{data["TOTAL-PAX"]}
            </Text>
            <br />
            {data["INCLUDE-PLATOONS"].map((platoon, index) => (
                <Box key={index}>
                    <Text as="div">*{platoon["PLATOON"]}*</Text>
                    <Text as="div">
                        Total: {platoon["PRESENT"]}/{platoon["TOTAL"]}
                    </Text>
                    <Text as="div">
                        Officers/WOSPECs: {platoon["OFFICER_WOSPEC_PRESENT"]}/
                        {platoon["OFFICER_WOSPEC_TOTAL"]}{" "}
                    </Text>
                    <Text as="div">
                        Specs: {platoon["SPEC_PRESENT"]}/{platoon["SPEC_TOTAL"]}{" "}
                    </Text>
                    <Text as="div">
                        Pioneers: {platoon["MEN_PRESENT"]}/
                        {platoon["MEN_TOTAL"]}
                    </Text>
                    <br />
                </Box>
            ))}
            <Text as="div">*_ATTC ({data["ATTC-PAX"]} Pax)_*</Text>
            {!!data["INCLUDE-ATTC"].length ? (
                data["INCLUDE-ATTC"].map((attc, index) => (
                    <Box key={index}>
                        <Link
                            href={`/personnel/manage/${attc["PID"]}`}
                            isExternal
                        >
                            {attc["INDEX"]}. {attc["RANK"]} {attc["NAME"]}
                        </Link>
                        <Text as="div">
                            {attc["START"]} - {attc["END"]}
                        </Text>
                        <br />
                    </Box>
                ))
            ) : (
                <br />
            )}
            <Text as="div">*_OFF ({data["OFF-PAX"]} Pax)_*</Text>
            {!!data["OFF-PAX"].length &&
                data["INCLUDE-OFF"].map((off, index) => (
                    <Box key={index}>
                        <Link
                            href={`/personnel/manage/${off["PID"]}`}
                            isExternal
                        >
                            {off["INDEX"]}. {off["RANK"]} {off["NAME"]}{" "}
                            {off["TYPE"]}
                        </Link>
                    </Box>
                ))}
            <br />
            <Text as="div">*_LEAVE ({data["LEAVE-PAX"]} Pax)_*</Text>
            {!!data["LEAVE-PAX"].length &&
                data["INCLUDE-LEAVE"].map((leave, index) => (
                    <Box key={index}>
                        <Link
                            href={`/personnel/manage/${leave["PID"]}`}
                            isExternal
                        >
                            {leave["INDEX"]}. {leave["RANK"]} {leave["NAME"]}{" "}
                            {leave["TYPE"]}
                        </Link>
                    </Box>
                ))}
            <br />

            <Text as="div">*_MA ({data["MA-PAX"]} Pax)_*</Text>
            {!!data["INCLUDE-MA"].length ? (
                data["INCLUDE-MA"].map((ma, index) => (
                    <Box key={index}>
                        <Link
                            href={`/personnel/manage/${ma["PID"]}`}
                            isExternal
                        >
                            {ma["INDEX"]}. {ma["RANK"]} {ma["NAME"]}
                        </Link>
                        <Text as="div">
                            {ma["MA_NAME"]} @ {ma["LOCATION"]} {ma["TIME"]}HRS
                        </Text>
                        <br />
                    </Box>
                ))
            ) : (
                <br />
            )}
            <Text as="div">*_STATUS ({data["STATUS-PAX"]} Pax)_*</Text>
            {!!data["INCLUDE-STATUS"].length ? (
                data["INCLUDE-STATUS"].map((person, index) => (
                    <Box key={index}>
                        <Link
                            href={`/personnel/manage/${person["PID"]}`}
                            isExternal
                        >
                            {person["INDEX"]}. {person["RANK"]} {person["NAME"]}
                        </Link>
                        {person["INCLUDE-STATUSES"].map(
                            (status: any, index: number) => (
                                <Text as="div" key={index}>
                                    •{status["NAME"]} ({status["STRING"]})
                                </Text>
                            )
                        )}
                        <br />
                    </Box>
                ))
            ) : (
                <br />
            )}
            <Text as="div">*_COURSE ({data["COURSE-PAX"]} Pax)_*</Text>
            {!!data["INCLUDE-COURSE"].length ? (
                data["INCLUDE-COURSE"].map((course, index) => (
                    <Box key={index}>
                        <Link
                            href={`/personnel/manage/${course["PID"]}`}
                            isExternal
                        >
                            {course["INDEX"]}. {course["RANK"]} {course["NAME"]}
                        </Link>
                        <Text as="div">
                            ({course["START"]} - {course["END"]})
                        </Text>
                        <br />
                    </Box>
                ))
            ) : (
                <br />
            )}
            <Text as="div">*_OTHERS ({data["OTHERS-PAX"]} Pax)_*</Text>
            {!!data["INCLUDE-OTHERS"].length &&
                data["INCLUDE-OTHERS"].map((others, index) => (
                    <Link
                        href={`/personnel/manage/${others["PID"]}`}
                        isExternal
                        key={index}
                    >
                        {others["INDEX"]}. {others["RANK"]} {others["NAME"]} (
                        {others["OTHERS_NAME"]})
                    </Link>
                ))}
            <br />
        </Box>
    );
});

export default ParadeStateFormat;
