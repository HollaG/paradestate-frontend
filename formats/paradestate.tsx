import { DictFormat } from "../pages/api/deliverables/parade-state/generate";
import { Text, Link, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { RefObject } from "react";
import React from "react";

const ParadeStateFormat = React.forwardRef<
    HTMLDivElement,
    { data: DictFormat }
>(({ data }, ref) => {
    const INCLUDE_PLATOONS = data["INCLUDE-PLATOONS"].map(
        (platoon, index) =>
            `*${platoon["PLATOON"]}*
Total: ${platoon["PRESENT"]}/${platoon["TOTAL"]}
Officers/WOSPECs: ${platoon["OFFICER_WOSPEC_PRESENT"]}/${platoon["OFFICER_WOSPEC_TOTAL"]}
Specs: ${platoon["SPEC_PRESENT"]}/${platoon["SPEC_TOTAL"]}
Pioneers: ${platoon["MEN_PRESENT"]}/${platoon["MEN_TOTAL"]}`
    );

    const INCLUDE_ATTC = data["INCLUDE-ATTC"].map(
        (attc, index) =>
            `${attc["INDEX"]}. ${attc["RANK"]} ${attc["NAME"]}
${attc["START"]} - ${attc["END"]}`
    );

    const INCLUDE_OFF = data["INCLUDE-OFF"].map(
        (off, index) =>
            `${off["INDEX"]}. ${off["RANK"]} ${off["NAME"]} ${off["TYPE"]}`
    );
    const INCLUDE_LEAVE = data["INCLUDE-LEAVE"].map(
        (leave, index) =>
            `${leave["INDEX"]}. ${leave["RANK"]} ${leave["NAME"]} ${leave["TYPE"]}`
    );

    const INCLUDE_MA = data["INCLUDE-MA"].map(
        (ma, index) =>
            // <Box key={index}>
            //     <Link href={`/personnel/manage/${ma["PID"]}`} isExternal>
            //         {ma["INDEX"]}. {ma["RANK"]} {ma["NAME"]}
            //     </Link>
            //     <br />
            //     {ma["MA_NAME"]} @ {ma["LOCATION"]} {ma["TIME"]}
            //     HRS
            //     {index !== data["INCLUDE-MA"].length - 1 && <br />}
            // </Box>
            `${ma["INDEX"]}. ${ma["RANK"]} ${ma["NAME"]}
${ma["MA_NAME"]} @ ${ma["LOCATION"]} ${ma["TIME"]}HRS`
    );

    const INCLUDE_STATUS = data["INCLUDE-STATUS"].map(
        (person, index) =>
            `${person["INDEX"]}. ${person["RANK"]} ${person["NAME"]}
${person["INCLUDE-STATUSES"]
    .map(
        (status: any, index: number) =>
            `•${status["NAME"]} (${status["STRING"]})`
    )
    .join("\n")}`
    );

    const INCLUDE_COURSE = data["INCLUDE-COURSE"].map(
        (course, index) =>
            `${course["INDEX"]}. ${course["RANK"]} ${course["NAME"]}
(${course["START"]} - ${course["END"]})`
    );

    const INCLUDE_OTHERS = data["INCLUDE-OTHERS"].map(
        (others, index) =>
            `${others["INDEX"]}. ${others["RANK"]} ${others["NAME"]} (${others["OTHERS_NAME"]})`
    );
    const text = `*${data["PLATOON-NAME"]} PARADE STATE AS OF ${
        data["SELECTED-DATE"]
    } 0800HRS*
Total: ${data["TOTAL-PRESENT"]}/${data["TOTAL-PAX"]}

${INCLUDE_PLATOONS.join("\n\n")}

*_ATTC (${data["ATTC-PAX"]} Pax)_*${
        !!INCLUDE_ATTC.length ? `\n${INCLUDE_ATTC.join("\n\n")}` : ""
    }

*_OFF (${data["OFF-PAX"]} Pax)_*${
        !!INCLUDE_OFF.length ? `\n${INCLUDE_OFF.join("\n")}` : ""
    }

*_LEAVE (${data["LEAVE-PAX"]} Pax)_*${
        !!INCLUDE_LEAVE.length ? `\n${INCLUDE_LEAVE.join("\n")}` : ""
    }

*_MA (${data["MA-PAX"]} Pax)_*${
        INCLUDE_MA.length ? `\n${INCLUDE_MA.join("\n\n")}` : ""
    }

*_STATUS (${data["STATUS-PAX"]} Pax)_*${
        INCLUDE_STATUS.length ? `\n${INCLUDE_STATUS.join("\n\n")}` : ""
    }

*_COURSE (${data["COURSE-PAX"]} Pax)_*${
        INCLUDE_COURSE.length ? `\n${INCLUDE_COURSE.join("\n\n")}` : ""
    }

*_OTHERS (${data["OTHERS-PAX"]} Pax)_*${
        INCLUDE_OTHERS.length ? `\n${INCLUDE_OTHERS.join("\n")}` : ""
    }
`;

    return (
        <Text whiteSpace="pre-wrap" ref={ref}>
            {text}
        </Text>
    );
    //     return (
    //         <Box ref={ref}>
    //             <Text>
    //                 *{data["PLATOON-NAME"]} PARADE STATE AS OF{" "}
    //                 {data["SELECTED-DATE"]} 0800HRS*
    //                 <br />
    //                 {/* </Text>
    //             <Text as="div"> */}
    //                 Total: {data["TOTAL-PRESENT"]}/{data["TOTAL-PAX"]}
    //             </Text>
    //             {/* <br /> */}
    //             {data["INCLUDE-PLATOONS"].map((platoon, index) => (
    //                 <Text key={index}>
    //                     {/* <Text as="div"> */}*{platoon["PLATOON"]}*{/* </Text> */}
    //                     <br />
    //                     {/* <Text as="div"> */}
    //                     Total: {platoon["PRESENT"]}/{platoon["TOTAL"]}
    //                     {/* </Text> */}
    //                     <br />
    //                     {/* <Text as="div"> */}
    //                     Officers/WOSPECs: {platoon["OFFICER_WOSPEC_PRESENT"]}/
    //                     {platoon["OFFICER_WOSPEC_TOTAL"]} {/* </Text> */}
    //                     <br />
    //                     {/* <Text as="div"> */}
    //                     Specs: {platoon["SPEC_PRESENT"]}/{platoon["SPEC_TOTAL"]}{" "}
    //                     {/* </Text> */}
    //                     <br />
    //                     {/* <Text as="div"> */}
    //                     Pioneers: {platoon["MEN_PRESENT"]}/{platoon["MEN_TOTAL"]}
    //                     {/* </Text> */}
    //                     {/* <br /> */}
    //                 </Text>
    //             ))}
    //             <Text>
    //                 *_ATTC ({data["ATTC-PAX"]} Pax)_*
    //                 {!!data["INCLUDE-ATTC"].length ? (
    //                     data["INCLUDE-ATTC"].map((attc, index) => (
    //                         <Box key={index}>
    //                             <Link
    //                                 href={`/personnel/manage/${attc["PID"]}`}
    //                                 isExternal
    //                             >
    //                                 {attc["INDEX"]}. {attc["RANK"]} {attc["NAME"]}
    //                             </Link>
    //                             <br />
    //                             {/* <Text as="div"> */}
    //                             {attc["START"]} - {attc["END"]}
    //                             {/* </Text> */}
    //                             {index !== data["INCLUDE-ATTC"].length - 1 && (
    //                                 <br />
    //                             )}
    //                         </Box>
    //                     ))
    //                 ) : (
    //                     <></>
    //                 )}
    //             </Text>
    //             <Text>
    //                 *_OFF ({data["OFF-PAX"]} Pax)_*
    //                 {!!data["OFF-PAX"].length &&
    //                     data["INCLUDE-OFF"].map((off, index) => (
    //                         <Box key={index}>
    //                             <Link
    //                                 href={`/personnel/manage/${off["PID"]}`}
    //                                 isExternal
    //                             >
    //                                 {off["INDEX"]}. {off["RANK"]} {off["NAME"]}{" "}
    //                                 {off["TYPE"]}
    //                             </Link>
    //                         </Box>
    //                     ))}
    //             </Text>
    //             <Text>
    //                 *_LEAVE ({data["LEAVE-PAX"]} Pax)_*
    //                 {!!data["LEAVE-PAX"].length &&
    //                     data["INCLUDE-LEAVE"].map((leave, index) => (
    //                         <Box key={index}>
    //                             <Link
    //                                 href={`/personnel/manage/${leave["PID"]}`}
    //                                 isExternal
    //                             >
    //                                 {leave["INDEX"]}. {leave["RANK"]}{" "}
    //                                 {leave["NAME"]} {leave["TYPE"]}
    //                             </Link>
    //                         </Box>
    //                     ))}
    //             </Text>
    //             <Text>
    //                 *_MA ({data["MA-PAX"]} Pax)_*
    //                 {!!data["INCLUDE-MA"].length ? (
    //                     data["INCLUDE-MA"].map((ma, index) => (
    //                         <Box key={index}>
    //                             <Link
    //                                 href={`/personnel/manage/${ma["PID"]}`}
    //                                 isExternal
    //                             >
    //                                 {ma["INDEX"]}. {ma["RANK"]} {ma["NAME"]}
    //                             </Link>
    //                             <br />
    //                             {ma["MA_NAME"]} @ {ma["LOCATION"]} {ma["TIME"]}
    //                             HRS
    //                             {index !== data["INCLUDE-MA"].length - 1 && <br />}
    //                         </Box>
    //                     ))
    //                 ) : (
    //                     <></>
    //                 )}
    //             </Text>
    //             <Text as="p">
    //                 *_STATUS ({data["STATUS-PAX"]} Pax)_*
    //                 {!!data["INCLUDE-STATUS"].length ? (
    //                     data["INCLUDE-STATUS"].map((person, index) => (
    //                         <Text as="div" key={index}>
    //                             <Link
    //                                 href={`/personnel/manage/${person["PID"]}`}
    //                                 isExternal
    //                             >
    //                                 {person["INDEX"]}. {person["RANK"]}{" "}
    //                                 {person["NAME"]}
    //                             </Link>
    //                             {person["INCLUDE-STATUSES"].map(
    //                                 (status: any, index: number) => (
    //                                     <Box  key={index}>
    //                                         •{status["NAME"]} ({status["STRING"]})
    //                                     </Box>
    //                                 )
    //                             )}

    //                         </Text>
    //                     ))
    //                 ) : (
    //                     <></>
    //                 )}
    //             </Text>
    //             <Text as="div">*_COURSE ({data["COURSE-PAX"]} Pax)_*</Text>
    //             {!!data["INCLUDE-COURSE"].length ? (
    //                 data["INCLUDE-COURSE"].map((course, index) => (
    //                     <Box key={index}>
    //                         <Link
    //                             href={`/personnel/manage/${course["PID"]}`}
    //                             isExternal
    //                         >
    //                             {course["INDEX"]}. {course["RANK"]} {course["NAME"]}
    //                         </Link>
    //                         <Text as="div">
    //                             ({course["START"]} - {course["END"]})
    //                         </Text>
    //                         <br />
    //                     </Box>
    //                 ))
    //             ) : (
    //                 <br />
    //             )}
    //             <Text as="div">*_OTHERS ({data["OTHERS-PAX"]} Pax)_*</Text>
    //             {!!data["INCLUDE-OTHERS"].length &&
    //                 data["INCLUDE-OTHERS"].map((others, index) => (
    //                     <Box key={index}>
    //                         <Link
    //                             href={`/personnel/manage/${others["PID"]}`}
    //                             isExternal
    //                         >
    //                             {others["INDEX"]}. {others["RANK"]} {others["NAME"]}{" "}
    //                             ({others["OTHERS_NAME"]})
    //                         </Link>
    //                         <br />
    //                     </Box>
    //                 ))}
    //             <br />
    //         </Box>
    //     );
});

export default ParadeStateFormat;
