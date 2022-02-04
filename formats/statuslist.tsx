import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { StatusListFormatInterface } from "../pages/api/deliverables/status-list/generate";

const StatusListFormat = React.forwardRef<
    HTMLDivElement,
    { data: StatusListFormatInterface }
>(({ data }, ref) => {
    return (
        <Box ref={ref}>
            <Text as="div">
                *{data["COMPANY-NAME"]} STATUS LIST AS OF{" "}
                {data["SELECTED-DATE"]}*
            </Text>
            <br />
            {!!data["INCLUDE-PLATOON-STATUS"].length &&
                data["INCLUDE-PLATOON-STATUS"].map((platoon, index) => (
                    <Box key={index}>
                        <Text as="div">
                            *{platoon["PLATOON"]} ({platoon["STATUS-PAX"]} PAX)*
                        </Text>
                        {platoon["INCLUDE-PERSONNEL"].map(
                            (personnel, index2) => (
                                <Box key={index2}>
                                    <Text as="div">
                                        {personnel["INDEX"]}.{" "}
                                        {personnel["RANK"]} {personnel["NAME"]}
                                    </Text>
                                    {personnel["INCLUDE-STATUSES"].map(
                                        (status, index) => (
                                            <Text as="div" key={index}>
                                                {" "}
                                                •{status["NAME"]} (
                                                {status["STRING"]})
                                            </Text>
                                        )
                                    )}
                                    <br />
                                </Box>
                            )
                        )}
                    </Box>
                ))}
            <Text as="div"></Text>
            <Text as="div"> </Text>
            <Text as="div"> </Text>
            <Text as="div"> </Text>
        </Box>
    );
});

export default StatusListFormat;
