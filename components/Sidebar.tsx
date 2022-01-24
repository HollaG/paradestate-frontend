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
} from "react-icons/fi";
import { IconType } from "react-icons";
import { ReactText } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import NextLink from "next/link";
interface LinkItemProps {
    name: string;
    icon: IconType | null;
    url?: string;
}
const LinkItems: Array<LinkItemProps> = [
    { name: "Dashboard", icon: FiHome, url: "/" },
    { name: "Overview", icon: FiTrendingUp, url: "/overview" },
    { name: "Analytics", icon: FiCompass, url: "/analytics" },
    {
        name: "Manage statuses (medical)",
        icon: FiStar,
        url: "/personnel/manage/status",
    },
    { name: "divider", icon: null },
    {
        name: "Parade state",
        icon: FiSettings,
        url: "/deliverables/parade-state",
    },
    { name: "Status list", icon: FiSettings },
    { name: "Audit log", icon: FiSettings },
    { name: "divider", icon: null },
    { name: "Manage personnel", icon: FiSettings },
    { name: "Manage website", icon: FiSettings },
    { name: "divider", icon: null },

    { name: "FAQ", icon: FiSettings },
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
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { data: session } = useSession();

    return (
        <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
            <SidebarContent
                onClose={() => onClose}
                display={{ base: "none", md: "block" }}
            />
            <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
            >
                <DrawerContent>
                    <SidebarContent onClose={onClose} />
                </DrawerContent>
            </Drawer>
            {/* mobilenav */}
            <MobileNav onOpen={onOpen} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                {!session && <SignInInfo />}
                {session && props.content}
            </Box>
        </Box>
    );
};

interface SidebarProps extends BoxProps {
    onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    const { data:session } = useSession()
    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue("white", "gray.900")}
            borderRight="1px"
            borderRightColor={useColorModeValue("gray.200", "gray.700")}
            w={{ base: "full", md: 60 }}
            pos="fixed"
            h="full"
            {...rest}
            overflowY="scroll"
        >
            <Flex
                h="20"
                alignItems="center"
                mx="8"
                justifyContent="space-between"
            >
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    {session?.user.unit} {session?.user.company}
                </Text>
                <CloseButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onClose}
                />
            </Flex>
            {LinkItems.map((link, index) => {
                if (link.name === "divider") return <Divider key={index} />;
                else if (link.icon === null) return <></>;
                else
                    return (
                        <NavItem key={index} icon={link.icon} url={link.url}>
                            {link.name}
                        </NavItem>
                    );
            })}
        </Box>
    );
};

interface NavItemProps extends FlexProps {
    icon: IconType;
    children: ReactText;
    url?: string;
}
const NavItem = ({ icon, children, url, ...rest }: NavItemProps) => {
    return (
        <NextLink href={url ? url : "/"} passHref>
            <Link
                style={{ textDecoration: "none" }}
                _focus={{ boxShadow: "none" }}
            >
                <Flex
                    align="center"
                    p="4"
                    mx="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{
                        bg: "cyan.400",
                        color: "white",
                    }}
                    {...rest}
                >
                    {icon && (
                        <Icon
                            mr="4"
                            fontSize="16"
                            _groupHover={{
                                color: "white",
                            }}
                            as={icon}
                        />
                    )}
                    {children}
                </Flex>
            </Link>
        </NextLink>
    );
};

interface MobileProps extends FlexProps {
    onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
    const { data: session } = useSession();

    const whiteGray900 = useColorModeValue("white", "gray.900");
    const gray200Gray700 = useColorModeValue("gray.200", "gray.700");
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={whiteGray900}
            borderBottomWidth="1px"
            borderBottomColor={gray200Gray700}
            justifyContent={{ base: "space-between", md: "flex-end" }}
            {...rest}
        >
            <IconButton
                display={{ base: "flex", md: "none" }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text
                display={{ base: "flex", md: "none" }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold"
            >
                {session?.user.unit} {session?.user.company}
            </Text>

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
                                        display={{ base: "none", md: "flex" }}
                                        alignItems="flex-start"
                                        spacing="1px"
                                        ml="2"
                                    >
                                        <Text fontSize="sm">
                                            {session?.user.username}{" "}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                            {session?.user.company}{" "}
                                            {session?.user.platoon}
                                        </Text>
                                    </VStack>
                                    <Box display={{ base: "none", md: "flex" }}>
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
    );
};
