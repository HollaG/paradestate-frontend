import React, {
    ReactNode,
    ReactPropTypes,
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    IconButton,
    Avatar,
    Box,
    CloseButton,
    Flex,
    HStack,
    VStack,
    Icon,
    useColorModeValue,
    Link,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    BoxProps,
    FlexProps,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuGroup,
    Divider,
    Button,
    Collapse,
    DrawerOverlay,
    Input,
    InputGroup,
    InputLeftElement,
    Container,
    AlertIcon,
    Alert,
    useToast,
    useBreakpointValue,
    useMediaQuery,
} from "@chakra-ui/react";
import {
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
    FiSettings,
    FiMenu,
    FiBell,
    FiChevronDown,
    FiSearch,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { ReactText } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import NextLink from "next/link";
import { FaClipboardCheck, FaRss, FaChevronDown } from "react-icons/fa";

import {
    IoAnalyticsOutline,
    IoArrowForward,
    IoBonfireOutline,
    IoCalendarOutline,
    IoChevronDown,
    IoChevronUp,
    IoFileTrayStackedOutline,
    IoFolderOpenOutline,
    IoHomeOutline,
    IoMailOutline,
    IoMedicalOutline,
    IoMegaphoneOutline,
    IoPartlySunnyOutline,
    IoPeopleOutline,
    IoSettingsOutline,
    IoTrendingUp,
} from "react-icons/io5";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useSwipeable } from "react-swipeable";
import appImage from "../public/pwa/icons/manifest-icon-512.png";

interface LinkItemProps {
    name: string;
    icon: IconType | null;
    url?: string;
}
const LinkItems: (
    | {
          name?: string;
          icon?: IconType;
          url?: string;
          isGroup?: undefined;
          disclosure?: undefined;
          children?: undefined;
          isDivider?: boolean;
      }
    | {
          name: string;
          isGroup: boolean;
          disclosure:
              | "personnel"
              | "event"
              | "format"
              | "paradestate"
              | "activities";
          children: {
              name: string;
              icon: IconType;
              url: string;
          }[];
          icon: IconType;
          url?: undefined;
          isDivider?: undefined;
      }
)[] = [
    { name: "Dashboard", icon: IoHomeOutline, url: "/" },
    { name: "Overview", icon: IoCalendarOutline, url: "/info/overview" },
    { name: "Analytics", icon: IoAnalyticsOutline, url: "/info/trends" },
    {
        name: "Add statuses (medical)",
        icon: IoMedicalOutline,
        url: "/personnel/manage/status",
    },
    { isDivider: true },

    {
        name: "Parade state",
        icon: IoMailOutline,
        url: "/deliverables/parade-state",
    },
    {
        name: "Status list",
        icon: IoMailOutline,
        url: "/deliverables/status-list",
    },
    {
        name: "Heat Acclimatisation",
        icon: IoPartlySunnyOutline,
        url: "/ha",
    },
    {
        isDivider: true,
    },
    {
        name: "Personnel",
        isGroup: true,
        disclosure: "personnel",
        icon: IoPeopleOutline,
        children: [
            {
                name: "Manage personnel",
                icon: FiSettings,
                url: "/personnel/manage",
            },
            {
                name: "Add personnel",
                icon: FiSettings,
                url: "/personnel/manage/add",
            },
            {
                name: "Import personnel",
                icon: FiSettings,
                url: "/personnel/manage/import",
            },
        ],
    },
    {
        name: "Activities",
        isGroup: true,
        disclosure: "activities",
        icon: IoMegaphoneOutline,
        children: [
            {
                name: "Agenda",
                icon: IoCalendarOutline,
                url: "/activity",
            },
            {
                name: "Add activity",
                icon: FiSettings,
                url: "/activity/add",
            },
        ],
    },
    
    {
        isDivider: true,
    },
    { name: "Audit log", icon: IoFileTrayStackedOutline, url: "/audit-log" },

    // {
    //     name: "Event Managers",
    //     isGroup: true,
    //     disclosure: "event",
    //     icon: IoSettingsOutline,
    //     children: [
    //         {
    //             name: "AttC Manager",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //         {
    //             name: "Off Manager",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //         {
    //             name: "Leave Manager",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //         {
    //             name: "Course Manager",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //         {
    //             name: "Medical Appointment Manager",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //         {
    //             name: "Other Appointments Manager",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //     ],
    // },
    // {
    //     name: "Deliverable formats",
    //     isGroup: true,
    //     disclosure: "format",
    //     icon: IoFolderOpenOutline,
    //     children: [
    //         {
    //             name: "Parade State",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //         {
    //             name: "Status List",
    //             icon: FiSettings,
    //             url: "/",
    //         },
    //     ],
    // },

    // { name: "FAQ", icon: FiSettings, url: "/" },
];

const Sidebar = (props: any) => {
    let session: Session | null;
    const { data } = useSession();
    if (props.session) session = props.session;
    else {
        session = data;
    }

    const sidebar = useDisclosure();
    const router = useRouter();
    const navigate = (url: string) => {
        sidebar.onClose();
        router.push(url);
    };

    const [isMobileMode] = useMediaQuery("(max-width: 48em)");

    const handlers = useSwipeable({
        // onSwiped: () => alert("swiped"),
        onSwipedLeft: () => (isMobileMode ? sidebar.onClose() : null),
        onSwipedRight: () => (isMobileMode ? sidebar.onOpen() : null),
        // preventDefaultTouchmoveEvent: true,

        trackTouch: true,
    });

    const discloures = {
        personnel: useDisclosure(),
        event: useDisclosure(),
        format: useDisclosure(),
        paradestate: useDisclosure(),
        activities: useDisclosure(),
    };
    const NavItem: React.FC<{ icon?: IconType; [key: string]: any }> = (
        props
    ) => {
        const { icon, children, ...rest } = props;
        return (
            <Flex
                align="center"
                px="4"
                mx="2"
                rounded="md"
                py="3"
                cursor="pointer"
                color="whiteAlpha.700"
                _hover={{
                    bg: "blackAlpha.300",
                    color: "whiteAlpha.900",
                }}
                role="group"
                fontWeight="semibold"
                transition=".15s ease"
                {...rest}
            >
                {icon && (
                    <Icon
                        mr="2"
                        boxSize="4"
                        _groupHover={{
                            color: "gray.300",
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        );
    };

    const SidebarContent: React.FC<{
        display?: {
            base: string;
            md: string;
        };
        w?: string;
        borderRight?: string;
        onClose?: () => void;
    }> = (props) => (
        <Box
            as="nav"
            pos="fixed"
            top="0"
            left="0"
            zIndex="sticky"
            h="full"
            pb="10"
            overflowX="hidden"
            overflowY="auto"
            bg="teal.600"
            borderColor="blackAlpha.300"
            borderRightWidth="1px"
            w="60"
            {...props}
        >
            <Flex px="4" py="5" align="center" key="testingtesting">
                {/* <Logo /> */}
                <Text fontSize="2xl" ml="2" color="white" fontWeight="semibold">
                    {session?.user?.unit} {session?.user?.company}
                </Text>
            </Flex>
            <Flex
                direction="column"
                as="nav"
                fontSize="sm"
                color="gray.600"
                aria-label="Main Navigation"
            >
                {LinkItems.map((link, index) => {
                    if (link.isDivider) {
                        return (
                            <Divider
                                key={index}
                                color="gray.400"
                                my={1}
                                opacity={0.3}
                            />
                        );
                    } else if (link.isGroup) {
                        return (
                            <Box key={index}>
                                <NavItem
                                    icon={link.icon}
                                    onClick={
                                        discloures[link.disclosure].onToggle
                                    }
                                >
                                    {link.name}
                                    <Icon
                                        as={IoChevronDown}
                                        ml="auto"
                                        transform={
                                            discloures[link.disclosure].isOpen
                                                ? "rotate(180deg)"
                                                : ""
                                        }
                                        sx={{ transition: "0.15s all" }}
                                    />
                                </NavItem>
                                <Collapse
                                    in={discloures[link.disclosure].isOpen}
                                >
                                    {link.children.map((child, index) => (
                                        <NavItem
                                            key={index}
                                            pl="12"
                                            py="2"
                                            icon={IoArrowForward}
                                            onClick={props.onClose || null}
                                        >
                                            <NextLink href={child.url} passHref>
                                                <Link>{child.name}</Link>
                                            </NextLink>
                                        </NavItem>
                                    ))}
                                </Collapse>
                            </Box>
                        );
                    } else
                        return (
                            <NavItem
                                key={index}
                                icon={link.icon}
                                onClick={() => navigate(link.url || "/")}
                            >
                                <NextLink href={link.url || "/"} passHref>
                                    <Link>{link.name}</Link>
                                </NextLink>
                            </NavItem>
                        );
                })}
            </Flex>
        </Box>
    );
    const whiteGray900 = useColorModeValue("white", "gray.900");
    const gray200Gray700 = useColorModeValue("gray.200", "gray.700");

    const [platoonHintShowing, setPlatoonHintShowing] = useState(false);
    const [hasChosenToHide, setHasChosenToHide] = useState(false);

    useEffect(() => {
        // This page will always hide the alert
        if (router.pathname === "/auth/registration") {
            setPlatoonHintShowing(false);
        } else if (
            // Only set to show when 1) user is logged in but no platoon 2) user is NOT on /auth/registration 3) user has NOT chosen to hide
            session &&
            session.user &&
            !session.user.platoon &&
            !hasChosenToHide
        )
            setPlatoonHintShowing(true);
        else if (session && session.user && session.user.platoon)
            setPlatoonHintShowing(false);
    }, [session, router, hasChosenToHide]);
    const toast = useToast();
    const closeHint = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setPlatoonHintShowing(false);
        setHasChosenToHide(true);
        toast({
            title: "Reminder",
            description:
                "Change your platoon in future by clicking on your profile icon, then 'Change platoon'",
            status: "info",
            isClosable: true,
        });
        e.stopPropagation();
    };
    const goToSetPlatoon = () => router.push("/auth/registration");

    return (
        <Box
            as="section"
            bg={useColorModeValue("gray.50", "gray.700")}
            minH="100vh"
            {...handlers}
        >
            <SidebarContent display={{ base: "none", md: "unset" }} key={1} />
            <Drawer
                isOpen={sidebar.isOpen}
                onClose={sidebar.onClose}
                placement="left"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <SidebarContent
                        key={2}
                        w="full"
                        borderRight="none"
                        onClose={sidebar.onClose}
                    />
                </DrawerContent>
            </Drawer>
            <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
                <Box
                    position="fixed"
                    top={0}
                    right={0}
                    left={{ base: 0, md: 60 }}
                    zIndex="100"
                >
                    <Flex
                        as="header"
                        align="center"
                        justify="space-between"
                        w="full"
                        px="4"
                        bg={useColorModeValue("white", "gray.800")}
                        borderBottomWidth="1px"
                        borderColor="blackAlpha.300"
                        h="14"
                    >
                        <IconButton
                            aria-label="Menu"
                            display={{ base: "inline-flex", md: "none" }}
                            onClick={sidebar.onOpen}
                            icon={<FiMenu />}
                            size="sm"
                        />
                        <InputGroup
                            mx="2"
                            maxW="64"
                            display={{ base: "flex", md: "flex" }}
                        >
                            <InputLeftElement
                                color="gray.500"
                                children={<FiSearch />}
                            />
                            <Input placeholder="Search for stuff..." />
                        </InputGroup>

                        <HStack spacing={{ base: "0", md: "6" }}>
                            {/* {!(appinstalled || isPwa) && ( */}
                            <Button
                                colorScheme="teal"
                                onClick={() =>
                                    // router.push("/install")
                                    (location.href = "/install")
                                }
                                id="install-button"
                            >
                                Install
                            </Button>
                            {/* )} */}

                            <IconButton
                                size="lg"
                                variant="ghost"
                                aria-label="open menu"
                                icon={<FiBell />}
                            />
                            {session && session.user ? (
                                <Flex alignItems={"center"}>
                                    <Menu>
                                        <MenuButton
                                            py={2}
                                            transition="all 0.3s"
                                            _focus={{ boxShadow: "none" }}
                                        >
                                            <HStack>
                                                <Avatar
                                                    size={"sm"}
                                                    src={session.user.photo}
                                                    name={session.user.username}
                                                />
                                                <VStack
                                                    display={{
                                                        base: "none",
                                                        md: "flex",
                                                    }}
                                                    alignItems="flex-start"
                                                    spacing="1px"
                                                    ml="2"
                                                >
                                                    <Text fontSize="sm">
                                                        {session?.user.username}{" "}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                    >
                                                        {session?.user.company}{" "}
                                                        {session?.user.platoon}
                                                    </Text>
                                                </VStack>
                                                <Box
                                                    display={{
                                                        base: "none",
                                                        md: "flex",
                                                    }}
                                                >
                                                    <FiChevronDown />
                                                </Box>
                                            </HStack>
                                        </MenuButton>
                                        <MenuList
                                            bg={whiteGray900}
                                            borderColor={gray200Gray700}
                                        >
                                            {/* <MenuItem>Profile</MenuItem>
                                            <MenuItem>Settings</MenuItem> */}
                                            <MenuItem>
                                                <NextLink
                                                    href="/auth/registration?change=1"
                                                    passHref
                                                >
                                                    <Link>Change platoon</Link>
                                                </NextLink>
                                            </MenuItem>
                                            <MenuDivider />
                                            <MenuItem onClick={() => signOut()}>
                                                Sign out
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                            ) : (
                                // <Button colorScheme="teal" onClick={() => signIn()}>
                                //     Sign in
                                // </Button>
                                <></>
                            )}
                        </HStack>
                    </Flex>
                </Box>

                {/* TODO - change this to Just 1 container? */}
                <Box mt="56px">
                    <Collapse in={platoonHintShowing}>
                        <Alert
                            status="info"
                            cursor="pointer"
                            onClick={goToSetPlatoon}
                        >
                            <Container maxW="container.lg">
                                <Flex alignItems="center">
                                    <AlertIcon />
                                    <Text flexGrow={1}>
                                        You have not yet set your platoon. Set
                                        it by clicking on this alert.
                                    </Text>
                                    <CloseButton onClick={closeHint} />
                                </Flex>
                            </Container>
                        </Alert>
                    </Collapse>
                    <Box as="main" p="4">
                        <Container maxW="container.lg" p={{ base: 0, md: 3 }}>
                            {props.children}
                        </Container>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
