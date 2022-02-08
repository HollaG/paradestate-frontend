import {
    Badge,
    Box,
    Button,
    Heading,
    Input,
    InputGroup,
    InputLeftAddon,
    Link,
    Select,
    Stack,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { GetServerSidePropsContext, NextPage } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import ErrorText from "../../components/Forms/ErrorText";
import executeQuery from "../../lib/db";
import fetcher, { sendPOST } from "../../lib/fetcher";
import Assignments from "../../config/assignments.json";

import { useEffect, useState } from "react";
import AuthHeading from "../../components/Auth/AuthHeading";
import React from "react";
import useSWRImmutable from "swr/immutable";
import useSWR from "swr";
import { CreatableSelect, OptionBase } from "chakra-react-select";
import { NextProtectedPage } from "../../lib/auth";
import NextLink from "next/link";
import HelpText from "../../components/Forms/HelpText";

const AddCompany: React.FC<{
    orderedByUnit: { [key: string]: CompanyRow[] };
    setCompany: React.Dispatch<React.SetStateAction<string>>;
    setUnit: React.Dispatch<React.SetStateAction<string>>;
}> = ({ orderedByUnit, setCompany, setUnit }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
    } = useForm();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const createCompany = async (data: any) => {
        setIsLoading(true);
        console.log({ data });
        const company = data.company.trim().toUpperCase();
        const unit = data.unit.value.trim().toUpperCase();
        const password = data.password;

        const responseData = await sendPOST("/api/auth/company", {
            company,
            unit,
            password,
        });

        if (responseData.success) {
            // router.reload();
            // router.push("/auth/set-platoon");
            setCompany(responseData.data.company);
            setUnit(responseData.data.unit);
        } else {
            if (responseData.type === "exists") {
                setError("company", {
                    type: "exists",
                    message: "This company already exists!",
                });
            }
        }
        setIsLoading(false);
    };
    return (
        <form onSubmit={handleSubmit(createCompany)} style={{ width: "100%" }}>
            <Stack direction="column" align="center">
                <Box w="100%">
                    <Controller
                        name="unit"
                        control={control}
                        rules={{
                            required: true,
                        }}
                        render={({ field: { onChange, value = [] } }) => (
                            <CreatableSelect<PlatoonOption, true>
                                name="unit"
                                placeholder="Select or enter a unit..."
                                options={Object.keys(orderedByUnit).map(
                                    (key) => ({
                                        label: key,
                                        value: key,
                                    })
                                )}
                                value={value}
                                onChange={onChange}
                            />
                        )}
                    />
                    <Box alignSelf="start">
                        {errors?.unit?.type === "required" && (
                            <ErrorText text="Please select a unit" />
                        )}
                    </Box>
                </Box>
                <Box w="100%">
                    <InputGroup>
                        <InputLeftAddon children="Company" />
                        <Input
                            placeholder="Please type the name of your company."
                            {...register("company", { required: true })}
                        />
                    </InputGroup>
                    {errors.company && (
                        <ErrorText
                            text={
                                errors.company.message ||
                                "Company name must not be empty."
                            }
                        />
                    )}
                </Box>
                <Box w="100%">
                    <InputGroup>
                        <InputLeftAddon children="Password" />
                        <Input
                            // type="password"
                            placeholder="Enter a password for this company."
                            {...register("password", {
                                required: true,
                                minLength: 8,
                            })}
                        />
                    </InputGroup>

                    {errors.password ? (
                        <ErrorText
                            text={
                                errors.password.message ||
                                "Password must be at least 8 characters long!"
                            }
                        />
                    ) : (
                        <HelpText text="Your password must be at least 8 characters long. This password will be used to authenticate future commanders in your company." />
                    )}
                </Box>

                <Button colorScheme="teal" type="submit" isLoading={isLoading}>
                    Submit
                </Button>
            </Stack>
        </form>
    );
};

const ChooseCompany: React.FC<{
    orderedByUnit: { [key: string]: CompanyRow[] };
    setCompany: React.Dispatch<React.SetStateAction<string>>;
    setUnit: React.Dispatch<React.SetStateAction<string>>;
}> = ({ orderedByUnit, setCompany, setUnit }) => {
    const { data: session } = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const checkPassword = async (data: any) => {
        setIsLoading(true);
        const responseData = await sendPOST("/api/auth/password", data);

        if (responseData.success) {
            // router.reload();
            // router.push("/auth/set-platoon");
            setCompany(responseData.data.company);
            setUnit(responseData.data.unit);
        } else {
            if (responseData.type === "wrong_password") {
                setError("password", {
                    type: "wrong_password",
                    message: "Password is incorrect, please try again.",
                });
            }
        }
        setIsLoading(false);
    };
    return (
        <form onSubmit={handleSubmit(checkPassword)} style={{ width: "100%" }}>
            <Stack direction="column" align="center">
                <Box w="100%">
                    <Select
                        placeholder="Select your company..."
                        {...register(`unit${Assignments.separator}company`, {
                            required: true,
                        })}
                    >
                        {Object.keys(orderedByUnit).map((unit, index) => (
                            <optgroup label={unit} key={index}>
                                {orderedByUnit[unit].map(
                                    (companyRow, index) => (
                                        <option
                                            value={`${unit}${Assignments.separator}${companyRow.company}`}
                                            key={index}
                                        >
                                            {unit} {companyRow.company}
                                        </option>
                                    )
                                )}
                            </optgroup>
                        ))}
                    </Select>
                    <Box alignSelf="start">
                        {errors?.[`unit${Assignments.separator}company`]
                            ?.type === "required" && (
                            <ErrorText text="Please select a unit" />
                        )}
                    </Box>
                </Box>
                <Box w="100%">
                    <InputGroup>
                        <InputLeftAddon children="Password" />
                        <Input
                            type="password"
                            placeholder="Enter company password"
                            {...register("password", { required: true })}
                        />
                    </InputGroup>
                    {errors.password && (
                        <ErrorText
                            text={
                                errors.password.message ||
                                "Password must not be empty."
                            }
                        />
                    )}
                </Box>
                <Button colorScheme="teal" type="submit" isLoading={isLoading}>
                    Submit
                </Button>
            </Stack>
        </form>
    );
};
const SetCompany: React.FC<{
    orderedByUnit: { [key: string]: CompanyRow[] };
    setCompany: React.Dispatch<React.SetStateAction<string>>;
    setUnit: React.Dispatch<React.SetStateAction<string>>;
}> = React.memo(({ orderedByUnit, setCompany, setUnit }) => {
    console.log({ orderedByUnit });
    const { data: session } = useSession();

    const [addNewCompany, setAddNewCompany] = useState(false);
    const noCompanyOrUnit = () => setAddNewCompany((prev) => !prev);

    return (
        // <form onSubmit={handleSubmit(checkPassword)}>
        <Stack direction="column" align="center">
            <AuthHeading step={0}>
                {" "}
                Hello, {session?.user?.username}!
            </AuthHeading>
            <Text textAlign="center">
                As this is your first time logging in, please choose your unit
                and company.
            </Text>
            {!addNewCompany && (
                <ChooseCompany
                    orderedByUnit={orderedByUnit}
                    setCompany={setCompany}
                    setUnit={setUnit}
                />
            )}
            {addNewCompany && (
                <AddCompany
                    orderedByUnit={orderedByUnit}
                    setCompany={setCompany}
                    setUnit={setUnit}
                />
            )}
           
            <Button colorScheme="purple" size="sm" onClick={noCompanyOrUnit}>{addNewCompany ? "My company already exists" : "I can't find my company or unit"}</Button>

            {/* </Stack> */}
        </Stack>
        // </form>
    );
});

interface PlatoonOption extends OptionBase {
    label: string;
    value: string;
}

const SetPlatoon: React.FC<{
    company: string;
    unit: string;
    defaultPlatoon: string;
    setPlatoon: React.Dispatch<React.SetStateAction<string>>;
}> = ({ company, unit, setPlatoon, defaultPlatoon = "" }) => {
    const { data, error } = useSWR<PlatoonOption[]>(
        `/api/auth/platoons?unit=${unit}&company=${company}`,
        fetcher
    );
    console.log({ data, error });
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const { control, handleSubmit } = useForm();

    const skip = () => setPlatoon("skipped");
    const submit = async (data: any) => {
        setIsLoading(true);
        console.log(data.platoon.value, "asdabsjkd");
        const selected = data.platoon.value.trim().toUpperCase();

        console.log({
            unit,
            company,
            platoon: selected,
        });
        const responseData = await sendPOST("/api/auth/platoons", {
            unit,
            company,
            platoon: selected,
        });

        if (responseData.success) {
            // bleh
            console.log("success!");
            setPlatoon(selected);
        } else {
            alert(responseData.error);
        }
    };
    console.log({ defaultPlatoon }, "dnjfansjk");
    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack direction="column" align="center">
                <AuthHeading step={1}>
                    Hello, {session?.user?.username}!
                </AuthHeading>
                <Text textAlign="center">
                    Please select your platoon. This step is optional; you can
                    always set or change your platoon in the future.
                </Text>
                <Text textAlign="center">
                    If your platoon does not exist, please type the new platoon
                    name and enter it.
                </Text>
                <Box w="100%">
                    <Controller
                        name="platoon"
                        control={control}
                        rules={{
                            required: true,
                        }}
                        defaultValue={
                            defaultPlatoon
                                ? {
                                      value: defaultPlatoon,
                                      label: defaultPlatoon,
                                  }
                                : []
                        }
                        render={({ field: { onChange, value = [] } }) => (
                            <CreatableSelect<PlatoonOption, true>
                                name="platoon"
                                placeholder="Select or enter a platoon..."
                                options={data}
                                value={value}
                                onChange={onChange}
                            />
                        )}
                    />
                </Box>
                <Stack direction="row">
                    <Button colorScheme="purple" onClick={skip}>
                        Skip
                    </Button>
                    <Button
                        colorScheme="teal"
                        type="submit"
                        isLoading={isLoading}
                    >
                        Submit
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};

const Completed: React.FC<{
    company: string;
    platoon: string;
    unit: string;
}> = ({ company, platoon, unit }) => {
    const { data: session } = useSession();

    const [timeLeft, setTimeLeft] = useState(5);
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((timeLeft) => (!timeLeft ? timeLeft : timeLeft - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [setTimeLeft]);
    useEffect(() => {
        if (timeLeft === 0) {
            console.log("ding ding redirect");
            redirectToHome();
        }
    }, [timeLeft]);

    const router = useRouter();
    const redirectToHome = () => {
        location.href = "/"; // need to refresh page to update session
        // let url = '/auth/complete'
        // if (change) url += '?change=true'
        // router.push(url);
        // router.reload();
    };
    console.log({platoon}) 
    return (
        <Stack direction="column" align="center">
            <AuthHeading step={2} skippedOpt={platoon === "skipped"}>
                Hello, {session?.user?.username}!
            </AuthHeading>
            <Text textAlign="center">
                Registration completed! You will be redirected shortly.
            </Text>
            <Stack direction="row" spacing={10}>
                <Stat>
                    <StatLabel>Unit</StatLabel>
                    <StatNumber>
                        <Badge fontSize="lg" colorScheme="purple">
                            {unit}
                        </Badge>
                    </StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Company</StatLabel>
                    <StatNumber>
                        <Badge fontSize="lg" colorScheme="purple">
                            {company}
                        </Badge>
                    </StatNumber>
                </Stat>
            </Stack>

            <Stat>
                <StatLabel>Platoon</StatLabel>
                <StatNumber>
                    <Badge fontSize="lg" colorScheme="purple">
                        {session?.user?.platoon ||
                            (platoon === "skipped" ? "Not yet set" : platoon)}
                    </Badge>
                </StatNumber>
            </Stat>

            <Button colorScheme="teal" onClick={redirectToHome}>
                Home ({timeLeft}s)
            </Button>
        </Stack>
    );
};

const RegistrationPage: NextProtectedPage<{
    orderedByUnit: { [key: string]: CompanyRow[] };
}> = ({ orderedByUnit }) => {
    const { data: session } = useSession();
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [company, setCompany] = useState("");
    const [unit, setUnit] = useState("");
    const [platoon, setPlatoon] = useState("");
    const [defaultPlatoon, setDefaultPlatoon] = useState("");
    console.log({ defaultPlatoon });
    useEffect(() => {
        // don't set the platoon yet so that we can allow users to change it later
        setDefaultPlatoon(session?.user?.platoon || "");
        setCompany(session?.user?.company || "");
        setUnit(session?.user?.unit || "");
    }, [session, setDefaultPlatoon, setCompany, setUnit]);
    if (company && unit && platoon)
        return <Completed company={company} unit={unit} platoon={platoon} />;
    if (company && unit && !platoon)
        return (
            <SetPlatoon
                company={company}
                unit={unit}
                setPlatoon={setPlatoon}
                defaultPlatoon={defaultPlatoon}
            />
        );

    return (
        <SetCompany
            orderedByUnit={orderedByUnit}
            setCompany={setCompany}
            setUnit={setUnit}
        />
    );
};

interface CompanyRow {
    company: string;
    unit: string;
}
export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getSession(context);
    const change = context.query.change;
    if (Boolean(change)) {
        return {
            props: {
                session,
                orderedByUnit: {},
            },
        };
    }

    if (
        session?.user?.company &&
        session?.user?.unit &&
        session?.user?.platoon
    ) {
        // Only block this page if the user has set all company, unit and platoon.
        console.log("Redirecting from registration page");
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const companies: CompanyRow[] = await executeQuery({
        query: `SELECT company, unit FROM company_list`,
        values: [],
    });

    const orderedByUnit = companies.reduce<{
        [key: string]: CompanyRow[];
    }>((r, a) => {
        r[a.unit] = [...(r[a.unit] || []), a];
        return r;
    }, {});

    return {
        props: {
            session,
            orderedByUnit,
        },
    };
};

export default React.memo(RegistrationPage);
