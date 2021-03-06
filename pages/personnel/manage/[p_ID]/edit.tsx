import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import useSWRImmutable from "swr/immutable";

import { NextProtectedPage } from "../../../../lib/auth";
import fetcher, { sendPOST } from "../../../../lib/fetcher";
import { Personnel } from "../../../../types/database";
import Assignments from "../../../../config/assignments.json";
import { useCallback, useEffect, useState } from "react";
import AddFormTemplate from "../../../../components/Personnel/Status/Manage/AddFormTemplate";
import { isBefore } from "date-fns";
import { Button, Center, Heading, Stack, useToast } from "@chakra-ui/react";
import CustomBigAlert from "../../../../components/Alert/CustomBigAlert";
import CustomStepper from "../../../../components/Common/CustomStepper";

const steps = ["Edit personnel", "Success"];
const EditPage: NextProtectedPage = () => {
    const router = useRouter();

    const personnel_ID = router.query.p_ID;
    const { data, error, mutate } = useSWRImmutable<Personnel>(
        `/api/personnel/manage/${personnel_ID}/edit`,
        fetcher
    );
    const { data: platoonData, error: platoonError } = useSWRImmutable<{
        platoons: string[];
        sections: string[];
    }>("/api/personnel/manage/add", fetcher);
    const toast = useToast()

    const methods = useForm<any>({
        defaultValues: {
            svc_status: { label: "NSF/NSMAN", value: "NSF/NSMAN" },
            post_in: new Date(),
            ord: new Date(),
        },
    });
    const reset = methods.reset
    useEffect(() => {
        if (data) {
            reset({
                svc_status: {
                    label: data.svc_status,
                    value: data.svc_status,
                },
                rank: { label: data.rank, value: data.rank },
                name: data.name,
                pes: { label: data.pes, value: data.pes },
                post_in: new Date(data.post_in),
                ord: new Date(data.ord),

                platoon: { label: data.platoon, value: data.platoon },
                pers_num: data.pers_num,
            });
        }
    }, [data, reset]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [personnelData, setPersonnelData] = useState<Personnel>();
    const submit = async (data: any) => {
        setIsSubmitting(true);
        const { post_in, ord, name, pers_num } = data;

        if (isBefore(ord, post_in)) {
            methods.setError("ord", {
                type: "wrong_date",
                message: "ORD must be after post in date!",
            });
            methods.setError("post_in", {
                type: "wrong_date",
                message: "ORD must be after post in date!",
            });
            setIsSubmitting(false);
            return;
        }
        const pes = data.pes.value;
        const platoon = data.platoon.value;
        const rank = data.rank.value;
        const svc_status = data.svc_status.value;
        const responseData = await sendPOST(`/api/personnel/manage/${personnel_ID}/edit`, {
            post_in,
            ord,
            name,
            pes,
            platoon,
            rank,
            svc_status,
            pers_num
        });
        if (responseData.success) {
            setSuccess(true);
            console.log(responseData.data);
            setPersonnelData(responseData.data);
        } else {
            toast({
                title: "Error",
                description: responseData.error,
                status: "error",
            });
        }
        setIsSubmitting(false);
      
    };

    const [secondsLeft, setSecondsLeft] = useState(10);
    useEffect(() => {
        if (!success) return;

        const interval = setInterval(
            () => setSecondsLeft((prev) => (!prev ? prev : prev - 1)),
            1000
        ); // subtract if not 0 (!!0 --> false)
        return () => clearInterval(interval);
    }, [success, setSecondsLeft]);

    const redirectToHome = useCallback(() => {
        setSuccess(false);
        setSecondsLeft(10)
        if (personnelData)
            reset({
                svc_status: {
                    label: personnelData.svc_status,
                    value: personnelData.svc_status,
                },
                rank: { label: personnelData.rank, value: personnelData.rank },
                name: personnelData.name,
                pes: { label: personnelData.pes, value: personnelData.pes },
                post_in: new Date(personnelData.post_in),
                ord: new Date(personnelData.ord),

                platoon: { label: personnelData.platoon, value: personnelData.platoon },
            });
        // mutate()
    }, [setSuccess, reset, personnelData]);
    const redirectToPersonnelPage = useCallback(
        () => router.push(`/personnel/manage/${personnelData?.personnel_ID}`),
        [personnelData, router]
    );
    useEffect(() => {
        if (secondsLeft <= 0) {
            redirectToHome();
        }
    }, [secondsLeft, redirectToHome]);
    if (success)
        return (
            <Stack direction="column">
                <Center>
                    <Heading> Add Personnel </Heading>
                </Center>
                <Center>
                    <CustomStepper step={1} steps={steps} />
                </Center>

                <CustomBigAlert header="Personnel added!">
                    <>
                        Your personnel {personnelData?.rank}{" "}
                        {personnelData?.name} has been updated.
                        <Stack direction="row" justifyContent="center" mt={1}>
                            <Button
                                size="xs"
                                colorScheme="teal"
                                onClick={redirectToPersonnelPage}
                            >
                                Personnel page
                            </Button>
                            <Button
                                size="xs"
                                colorScheme="teal"
                                onClick={redirectToHome}
                            >
                                Back to editing ({secondsLeft}s)
                            </Button>
                        </Stack>
                    </>
                </CustomBigAlert>
            </Stack>
        );
    if (data && platoonData)
        return (
            <FormProvider {...methods}>
                <AddFormTemplate
                    isSubmitting={isSubmitting}
                    steps={steps}
                    step={0}
                    submit={submit}
                    platoons={platoonData?.platoons}
                    sections={platoonData?.sections}
                />
            </FormProvider>
        );
    return <>Edit page</>;
};

EditPage.requireAuth = true;
export default EditPage;
