import React, { ReactNode, ReactPropTypes } from "react";
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

import { IoAnalyticsOutline, IoArrowForward, IoCalendarOutline, IoChevronDown, IoChevronUp, IoFileTrayStackedOutline, IoFolderOpenOutline, IoHomeOutline, IoMailOutline, IoMedicalOutline, IoPeopleOutline, IoSettingsOutline, IoTrendingUp } from "react-icons/io5";
interface LinkItemProps {
    name: string;
    icon: IconType | null;
    url?: string;
}
const LinkItems: (
    | {
          name: string;
          icon: IconType;
          url: string;
          isGroup?: undefined;
          disclosure?: undefined;
          children?: undefined;
      }
    | {
          name: string;
          isGroup: boolean;
          disclosure: "personnel" | "event" | "format";
          children: {
              name: string;
              icon: IconType;
              url: string;
          }[];
          icon: IconType;
          url?: undefined;
      }
)[] = [
    { name: "Dashboard", icon: IoHomeOutline, url: "/" },
    { name: "Overview", icon: IoCalendarOutline, url: "/overview" },
    { name: "Analytics", icon: IoAnalyticsOutline, url: "/analytics" },
    {
        name: "Manage statuses (medical)",
        icon: IoMedicalOutline,
        url: "/personnel/manage/status",
    },

    {
        name: "Parade state",
        icon: IoMailOutline,
        url: "/deliverables/parade-state",
    },
    { name: "Status list", icon: IoMailOutline, url: "/" },
    { name: "Audit log", icon: IoFileTrayStackedOutline, url: "/" },
    {
        name: "Personnel",
        isGroup: true,
        disclosure: "personnel",
        icon: IoPeopleOutline,
        children: [
            { name: "Manage personnel", icon: FiSettings, url: "/" },
            { name: "Manage website", icon: FiSettings, url: "/" },
        ],
    },
    {
        name: "Event Managers",
        isGroup: true,
        disclosure: "event",
        icon: IoSettingsOutline,
        children: [
            {
                name: "AttC Manager",
                icon: FiSettings,
                url: "/",
            },
            {
                name: "Off Manager",
                icon: FiSettings,
                url: "/",
            },
            {
                name: "Leave Manager",
                icon: FiSettings,
                url: "/",
            },
            {
                name: "Course Manager",
                icon: FiSettings,
                url: "/",
            },
            {
                name: "Medical Appointment Manager",
                icon: FiSettings,
                url: "/",
            },
            {
                name: "Other Appointments Manager",
                icon: FiSettings,
                url: "/",
            },
        ],
    },
    {
        name: "Deliverable formats",
        isGroup: true,
        disclosure: "format",
        icon: IoFolderOpenOutline,
        children: [
            {
                name: "Parade State",
                icon: FiSettings,
                url: "/",
            },
            {
                name: "Status List",
                icon: FiSettings,
                url: "/",
            },
        ],
    },

    { name: "FAQ", icon: FiSettings, url: "/" },
];

const SignInInfo: React.FC = () => {
    return (
        <Box justify="center" align="center">
            <Text fontSize="2xl" textAlign="center">
                You are not signed in. Please sign in to access this website.
            </Text>

            <Button colorScheme="teal" onClick={() => signIn()}>
                Sign in
            </Button>
        </Box>
    );
};

export default (props: any) => {
    const sidebar = useDisclosure();
    const personnelDropdown = useDisclosure();
    const eventDropdown = useDisclosure();
    const formatDropdown = useDisclosure();

    const discloures = {
        personnel: useDisclosure(),
        event: useDisclosure(),
        format: useDisclosure(),
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
            <Flex px="4" py="5" align="center">
                {/* <Logo /> */}
                <Text fontSize="2xl" ml="2" color="white" fontWeight="semibold">
                    Choc UI
                </Text>
            </Flex>
            <Flex
                direction="column"
                as="nav"
                fontSize="sm"
                color="gray.600"
                aria-label="Main Navigation"
            >
                {LinkItems.map((link) => {
                    if (link.isGroup) {
                        return (
                            <>
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
                                    {link.children.map((child) => (
                                        <NavItem pl="12" py="2" icon={IoArrowForward}>
                                            {child.name}
                                        </NavItem>
                                    ))}
                                </Collapse>
                            </>
                        );
                    } else return <NavItem icon={link.icon}>{link.name}</NavItem>;
                })}
            </Flex>
        </Box>
    );
    const whiteGray900 = useColorModeValue("white", "gray.900");
    const gray200Gray700 = useColorModeValue("gray.200", "gray.700");
    const { data: session } = useSession();
    return (
        <Box
            as="section"
            bg={useColorModeValue("gray.50", "gray.700")}
            minH="100vh"
        >
            <SidebarContent display={{ base: "none", md: "unset" }} />
            <Drawer
                isOpen={sidebar.isOpen}
                onClose={sidebar.onClose}
                placement="left"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <SidebarContent w="full" borderRight="none" />
                </DrawerContent>
            </Drawer>
            <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
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
                        <IconButton
                            size="lg"
                            variant="ghost"
                            aria-label="open menu"
                            icon={<FiBell />}
                        />
                        {session && (
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
                                                src={
                                                    session
                                                        ? session.user.photo
                                                        : "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                                                }
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
                                        <MenuItem>Profile</MenuItem>
                                        <MenuItem>Settings</MenuItem>
                                        <MenuItem>Billing</MenuItem>
                                        <MenuDivider />
                                        <MenuItem onClick={() => signOut()}>
                                            Sign out
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                        )}
                        {!session && (
                            <Button colorScheme="teal" onClick={() => signIn()}>
                                Sign in
                            </Button>
                        )}
                    </HStack>
                </Flex>

                <Box as="main" p="4">
                    {props.content}
                </Box>
            </Box>
        </Box>
    );
};
