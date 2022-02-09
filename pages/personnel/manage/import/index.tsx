import {
    Stack,
    Center,
    Heading,
    useColorModeValue,
    Text,
    Button,
    OrderedList,
    ListItem,
    InputGroup,
    InputLeftElement,
    Input,
    InputLeftAddon,
} from "@chakra-ui/react";
import { format, isValid, parse } from "date-fns";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";
import readXlsxFile from "read-excel-file";
import CustomStepper from "../../../../components/Common/CustomStepper";
import Assignments from "../../../../config/assignments.json";
import { NextProtectedPage } from "../../../../lib/auth";
import { openInNewTab } from "../../../../lib/custom";
import { sendPOST, sendPOSTFormData } from "../../../../lib/fetcher";
import { personnelActions } from "../../../../store/personnel-slice";
import { BasicPersonnel } from "../../../../types/database";
import { PersonnelImportState } from "../../../../types/types";

const steps = ["Select file", "Review details", "Success"];

const ImportPage: NextProtectedPage = () => {
    const onFileAccepted: (file: File) => void = (file) => console.log(file);

    const [file, setFile] = useState<File>();
    const [url, setUrl] = useState("");
    const onDrop = useCallback(
        (acceptedFiles) => {
            console.log(acceptedFiles);
            onFileAccepted(acceptedFiles[0]);
            setFile(acceptedFiles[0]);
        },
        [onFileAccepted]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ".xlsx",
        maxFiles: 1,
        multiple: false,
    });

    let dropText = isDragActive
        ? "Drop the files here ..."
        : "Drag and drop .xlsx file here, or click to select files";
    if (file) dropText = `File ${file.name} selected`;

    const activeBg = useColorModeValue("gray.100", "gray.600");
    const borderColor = useColorModeValue(
        isDragActive ? "teal.300" : "gray.300",
        isDragActive ? "teal.500" : "gray.500"
    );
    console.log({ file }, "file state");
    const viewFormat = () => openInNewTab('https://docs.google.com/spreadsheets/d/13lGNKFoR9I-J2mBiTEmGNzL9XfgwFTet_dLdq6I4PBA/edit?usp=sharing')

    const router = useRouter();
    const dispatch = useDispatch();
    const submit = async () => {
        // submit file and google sheets URL
        // const formData = new FormData();
        // if (!file && !url)
        //     return setError("Please select either a file or enter a URL!");

        // if (file) formData.append("file", file);
        // if (url) formData.append("url", url);
        // for (let key of formData.entries()) {
        //     console.log(key[0] + ", " + key[1]);
        // }
        // const responseData = await sendPOSTFormData("/api/personnel/manage/import", formData);

        const finalData: PersonnelImportState = { excel: [], googleSheets: [] };
        if (file) {
            const rows = await readXlsxFile(file);

            const headers = rows[0].map((header) =>
                header.toString().trim().toLowerCase()
            ) as string[];
            const data = rows.slice(1);
            const personnel = data.map((row) => {
                const obj: any = {};
                row.forEach((column, index) => (obj[headers[index]] = column));
                return obj;
            });
            console.log({ personnel, headers });

            const responseData:{success: boolean, data: BasicPersonnel[]} = await sendPOST(
                "/api/personnel/manage/import",
                { personnel }
            );
            console.log({ responseData });
            if (responseData.success) finalData.excel.push(...responseData.data);
        }

        console.log({ finalData });
        dispatch(personnelActions.setState(finalData));
        router.push("/personnel/manage/import/review");
    };

    return (
        <Stack direction="column">
            <Center>
                <Heading> Add Personnel </Heading>
            </Center>
            <Center>
                <CustomStepper step={0} steps={steps} />
            </Center>
            <Stack direction="column">
                <Center
                    height="200px"
                    // bgColor="gray.200"
                    borderRadius="lg"
                    border="2px dashed"
                    borderColor={borderColor}
                    bg={isDragActive ? activeBg : "transparent"}
                    _hover={{ bg: activeBg }}
                    transition="background-color 0.2s ease"
                    mt={5}
                    {...getRootProps()}
                >
                    <Text p={2} textAlign="center" fontWeight="semibold">
                        {dropText}{" "}
                    </Text>
                    <input {...getInputProps()} />
                </Center>
                <InputGroup>
                    <InputLeftAddon children="Google Sheets URL" />
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </InputGroup>
            </Stack>
            <Center>
                <Stack direction="row">
                    {/* <Heading fontSize="3xl"> Instructions </Heading> */}
                    <Button colorScheme="purple" onClick={viewFormat}> View import format </Button>
                    <Button colorScheme="teal" onClick={submit}>
                        {" "}
                        Submit{" "}
                    </Button>
                </Stack>
            </Center>
            {/* <OrderedList>
                <ListItem>
                    First, prepare the Excel or Google Sheets file in the
                    specified format.
                </ListItem>
                <ListItem> 
                    Import the file into the system.
                </ListItem>
                <ListItem> 
                    Fix any errors found by the system
                </ListItem>
            </OrderedList> */}
        </Stack>
    );
};
ImportPage.requireAuth = true;
export default ImportPage;
