// // import React, { ReactNode, ReactPropTypes } from "react";
// // import {
// //     IconButton,
// //     Avatar,
// //     Box,
// //     CloseButton,
// //     Flex,
// //     HStack,
// //     VStack,
// //     Icon,
// //     useColorModeValue,
// //     Link,
// //     Drawer,
// //     DrawerContent,
// //     Text,
// //     useDisclosure,
// //     BoxProps,
// //     FlexProps,
// //     Menu,
// //     MenuButton,
// //     MenuDivider,
// //     MenuItem,
// //     MenuList,
// //     MenuGroup,
// //     Divider,
// //     Button,
// // } from "@chakra-ui/react";
// import {
//     FiHome,
//     FiTrendingUp,
//     FiCompass,
//     FiStar,
//     FiSettings,
//     FiMenu,
//     FiBell,
//     FiChevronDown,
//     FiSearch,
// } from "react-icons/fi";
// // import { IconType } from "react-icons";
// // import { ReactText } from "react";
// // import { useSession, signOut, signIn } from "next-auth/react";
// // import NextLink from "next/link";
// // interface LinkItemProps {
// //     name: string;
// //     icon: IconType | null;
// //     url?: string;
// // }
// // const LinkItems: Array<LinkItemProps> = [
// //     { name: "Dashboard", icon: FiHome, url: "/" },
// //     { name: "Overview", icon: FiTrendingUp, url: "/overview" },
// //     { name: "Analytics", icon: FiCompass, url: "/analytics" },
// //     {
// //         name: "Manage statuses (medical)",
// //         icon: FiStar,
// //         url: "/personnel/manage/status",
// //     },
// //     { name: "divider", icon: null },
// //     {
// //         name: "Parade state",
// //         icon: FiSettings,
// //         url: "/deliverables/parade-state",
// //     },
// //     { name: "Status list", icon: FiSettings },
// //     { name: "Audit log", icon: FiSettings },
// //     { name: "divider", icon: null },
// //     { name: "Manage personnel", icon: FiSettings },
// //     { name: "Manage website", icon: FiSettings },
// //     { name: "divider", icon: null },

// import {
//     useDisclosure,
//     Flex,
//     Icon,
//     Box,
//     useColorModeValue,
//     Drawer,
//     DrawerOverlay,
//     DrawerContent,
//     IconButton,
//     InputGroup,
//     InputLeftElement,
//     Input,
//     Avatar,
//     Text,
//     Button,
//     HStack,
//     Menu,
//     MenuButton,
//     MenuDivider,
//     MenuItem,
//     MenuList,
//     VStack,
//     Collapse,
// } from "@chakra-ui/react";
// import { FaRss, FaClipboardCheck, FaBell } from "react-icons/fa";
// import { IconType } from "react-icons";
// import { prependOnceListener } from "process";
// import { signIn, signOut, useSession } from "next-auth/react";

// export default (props: any) => {
//     const sidebar = useDisclosure();
//     const personnelDropdown = useDisclosure()
//     const eventDropdown = useDisclosure()
//     const formatDropdown = useDisclosure()
//     const NavItem: React.FC<{ icon?: IconType, [key:string]: any }> = (props) => {
//         const { icon, children, ...rest } = props;
//         return (
//             <Flex
//                 align="center"
//                 px="4"
//                 mx="2"
//                 rounded="md"
//                 py="3"
//                 cursor="pointer"
//                 color="whiteAlpha.700"
//                 _hover={{
//                     bg: "blackAlpha.300",
//                     color: "whiteAlpha.900",
//                 }}
//                 role="group"
//                 fontWeight="semibold"
//                 transition=".15s ease"
//                 {...rest}
//             >
//                 {icon && (
//                     <Icon
//                         mr="2"
//                         boxSize="4"
//                         _groupHover={{
//                             color: "gray.300",
//                         }}
//                         as={icon}
//                     />
//                 )}
//                 {children}
//             </Flex>
//         );
//     };

//     const SidebarContent: React.FC<{
//         display?: {
//             base: string;
//             md: string;
//         };
//         w?: string;
//         borderRight?: string;
//     }> = (props) => (
//         <Box
//             as="nav"
//             pos="fixed"
//             top="0"
//             left="0"
//             zIndex="sticky"
//             h="full"
//             pb="10"
//             overflowX="hidden"
//             overflowY="auto"
//             bg="teal.600"
//             borderColor="blackAlpha.300"
//             borderRightWidth="1px"
//             w="60"
//             {...props}
//         >
//             <Flex px="4" py="5" align="center">
//                 {/* <Logo /> */}
//                 <Text fontSize="2xl" ml="2" color="white" fontWeight="semibold">
//                     Choc UI
//                 </Text>
//             </Flex>
//             <Flex
//                 direction="column"
//                 as="nav"
//                 fontSize="sm"
//                 color="gray.600"
//                 aria-label="Main Navigation"
//             >
//                 <NavItem icon={FaRss}>Dashboard</NavItem>
//                 <NavItem icon={FaRss}>Overview</NavItem>
//                 <NavItem icon={FaRss}>Analytics</NavItem>
//                 <NavItem icon={FaClipboardCheck}>Manage statuses (medical)</NavItem>
//                 <NavItem icon={FaClipboardCheck}>Parade state</NavItem>
//                 <NavItem icon={FaClipboardCheck}>Status list</NavItem>
//                 <NavItem icon={FaClipboardCheck}>Audit log</NavItem>
//                 <NavItem icon={FaRss} onClick={personnelDropdown.onToggle}>
//                     Personnel
//                     <Icon
//                         as={FaRss}
//                         ml="auto"
//                         // transform={integrations.isOpen && "rotate(90deg)"}
//                     />
//                 </NavItem>
//                 <Collapse in={personnelDropdown.isOpen}>
//                     <NavItem pl="12" py="2">
//                         Manage personnel
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Add new personnel
//                     </NavItem>

//                 </Collapse>

//                 <NavItem icon={FaRss} onClick={eventDropdown.onToggle}>
//                     Event Managers
//                     <Icon
//                         as={FaRss}
//                         ml="auto"
//                         // transform={integrations.isOpen && "rotate(90deg)"}
//                     />
//                 </NavItem>
//                 <Collapse in={eventDropdown.isOpen}>
//                     <NavItem pl="12" py="2">
//                         AttC manager
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Off manager
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Leave manager
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Course manager
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Medical Appointment manager
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Other Appointments manager
//                     </NavItem>

//                 </Collapse>

//                 <NavItem icon={FaRss} onClick={formatDropdown.onToggle}>
//                     Deliverable formats
//                     <Icon
//                         as={FaRss}
//                         ml="auto"
//                         // transform={integrations.isOpen && "rotate(90deg)"}
//                     />
//                 </NavItem>
//                 <Collapse in={formatDropdown.isOpen}>
//                     <NavItem pl="12" py="2">
//                         Parade State
//                     </NavItem>
//                     <NavItem pl="12" py="2">
//                         Status List
//                     </NavItem>

//                 </Collapse>
//                 <NavItem icon={FaClipboardCheck}>FAQ</NavItem>

//             </Flex>
//         </Box>
//     );
//     const whiteGray900 = useColorModeValue("white", "gray.900");
//     const gray200Gray700 = useColorModeValue("gray.200", "gray.700");
//     const { data: session } = useSession();
//     return (
//         <Box
//             as="section"
//             bg={useColorModeValue("gray.50", "gray.700")}
//             minH="100vh"
//         >
//             <SidebarContent display={{ base: "none", md: "unset" }} />
//             <Drawer
//                 isOpen={sidebar.isOpen}
//                 onClose={sidebar.onClose}
//                 placement="left"
//             >
//                 <DrawerOverlay />
//                 <DrawerContent>
//                     <SidebarContent w="full" borderRight="none" />
//                 </DrawerContent>
//             </Drawer>
//             <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
//                 <Flex
//                     as="header"
//                     align="center"
//                     justify="space-between"
//                     w="full"
//                     px="4"
//                     bg={useColorModeValue("white", "gray.800")}
//                     borderBottomWidth="1px"
//                     borderColor="blackAlpha.300"
//                     h="14"
//                 >
//                     <IconButton
//                         aria-label="Menu"
//                         display={{ base: "inline-flex", md: "none" }}
//                         onClick={sidebar.onOpen}
//                         icon={<FiMenu />}
//                         size="sm"
//                     />
//                     <InputGroup
//                         mx="2"
//                         maxW="64"
//                         display={{ base: "flex", md: "flex" }}
//                     >
//                         <InputLeftElement
//                             color="gray.500"
//                             children={<FiSearch />}
//                         />
//                         <Input placeholder="Search for stuff..." />
//                     </InputGroup>

//                     <HStack spacing={{ base: "0", md: "6" }}>
//                         <IconButton
//                             size="lg"
//                             variant="ghost"
//                             aria-label="open menu"
//                             icon={<FiBell />}
//                         />
//                         {session && (
//                             <Flex alignItems={"center"}>
//                                 <Menu>
//                                     <MenuButton
//                                         py={2}
//                                         transition="all 0.3s"
//                                         _focus={{ boxShadow: "none" }}
//                                     >
//                                         <HStack>
//                                             <Avatar
//                                                 size={"sm"}
//                                                 src={
//                                                     session
//                                                         ? session.user.photo
//                                                         : "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
//                                                 }
//                                             />
//                                             <VStack
//                                                 display={{
//                                                     base: "none",
//                                                     md: "flex",
//                                                 }}
//                                                 alignItems="flex-start"
//                                                 spacing="1px"
//                                                 ml="2"
//                                             >
//                                                 <Text fontSize="sm">
//                                                     {session?.user.username}{" "}
//                                                 </Text>
//                                                 <Text
//                                                     fontSize="xs"
//                                                     color="gray.600"
//                                                 >
//                                                     {session?.user.company}{" "}
//                                                     {session?.user.platoon}
//                                                 </Text>
//                                             </VStack>
//                                             <Box
//                                                 display={{
//                                                     base: "none",
//                                                     md: "flex",
//                                                 }}
//                                             >
//                                                 <FiChevronDown />
//                                             </Box>
//                                         </HStack>
//                                     </MenuButton>
//                                     <MenuList
//                                         bg={whiteGray900}
//                                         borderColor={gray200Gray700}
//                                     >
//                                         <MenuItem>Profile</MenuItem>
//                                         <MenuItem>Settings</MenuItem>
//                                         <MenuItem>Billing</MenuItem>
//                                         <MenuDivider />
//                                         <MenuItem onClick={() => signOut()}>
//                                             Sign out
//                                         </MenuItem>
//                                     </MenuList>
//                                 </Menu>
//                             </Flex>
//                         )}
//                         {!session && (
//                             <Button colorScheme="teal" onClick={() => signIn()}>
//                                 Sign in
//                             </Button>
//                         )}
//                     </HStack>
//                 </Flex>

//                 <Box as="main" p="4">
//                     {props.content}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

import { useState } from "react";
import {
    AppShell,
    Burger,
    Header,
    MediaQuery,
    Navbar,
    NavbarProps,
    Text,
    Transition,
    useMantineTheme,
    Drawer,
    createStyles,
    Title,
    Container,
    Group,
    Box,
    Button,
} from "@mantine/core";
import { FaRss } from "react-icons/fa";
import { IconType } from "react-icons";


const NavItem: React.FC<{ icon?: IconType }> = (props) => {
    const { icon, children, ...rest } = props;
    const theme = useMantineTheme();

    return (
        <Box
            
            sx={{
                display: "flex",
                alignItems: "center",
                // cursor: "pointer",
                // "&:hover": {
                //     background: "rgb(0,0,0,0.7)",
                //     color: "rgb(255,255,255,0.9)",
                // },
                fontWeight: "bold",
                transition: ".15s ease",
                borderRadius: "8px",
                width: '100%',
                // color: "rgb(255,255,255,0.7)"
            }}
            
            // ml="1"
            // mr="1"
            
            role="group"
            {...rest}
            color="white"
        >
            {/* {icon && (
                <Icon
                    mr="2"
                    boxSize="4"
                    _groupHover={{
                        color: "gray.300",
                    }}
                    as={icon}
                />
            )} */}
            <Button variant="filled" color='teal' fullWidth={true} >
                Hello
            </Button>
        </Box>
    );
};

const navbarLinks = [
    {
        label: "Home",
        url: "/",
        icon: <FaRss />,
    },
    {
        groupLabel: "Personnel",
        links: [
            {
                label: "Manage personnel",
                url: "/manage/personnel",
                icon: <FaRss />,
            },
        ],
    },
];

const LinksContainer: React.FC = () => {
    return <></>;
};

const useStyles = createStyles((theme) => ({
    drawer: { backgroundColor: theme.colors.teal[5] },
    title: { color: theme.white },
    root: { color: theme.colors.teal[5]}
}));

export default (props: any) => {
    const [opened, setOpened] = useState(false);
    const theme = useMantineTheme();
    const { classes } = useStyles();
    return (
        <>
            <AppShell
                // navbarOffsetBreakpoint controls when navbar should no longer be offset with padding-left
                navbarOffsetBreakpoint="sm"
                // fixed prop on AppShell will be automatically added to Header and Navbar
                fixed
                navbar={
                    <Navbar
                        padding="md"
                        // Breakpoint at which navbar will be hidden if hidden prop is true
                        hiddenBreakpoint="sm"
                        // Hides navbar when viewport size is less than value specified in hiddenBreakpoint
                        // hidden={!opened}
                        // when viewport size is less than theme.breakpoints.sm navbar width is 100%
                        // viewport size > theme.breakpoints.sm – width is 300px
                        // viewport size > theme.breakpoints.lg – width is 400px
                        width={{ sm: 300, lg: 400 }}
                    >
                        <Text>Application navbar</Text>
                    </Navbar>
                }
                header={
                    <Header height={70} padding="md">
                        {/* Handle other responsive styles with MediaQuery component or createStyles function */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <MediaQuery
                                largerThan="sm"
                                styles={{ display: "none" }}
                            >
                                <Burger
                                    opened={opened}
                                    onClick={() => setOpened((o) => !o)}
                                    size="sm"
                                    color={theme.colors.gray[6]}
                                    mr="xl"
                                />
                            </MediaQuery>

                            <Text>Application header</Text>
                        </div>
                    </Header>
                }
            >
                {props.content}
            </AppShell>
            <Drawer
                opened={opened}
                onClose={() => setOpened(false)}
                title={<Title sx={{ color: theme.white }}> Menu </Title>}
                padding="xl"
                size="md"
                classNames={{
                    drawer: classes.drawer,
                    title: classes.title,
                }}
            >
                <Group direction="column">
                    {navbarLinks.map((navbarLink) => {
                        if (navbarLink.links) {
                            return (
                                // <Group
                                //     direction="column"
                                //     key={navbarLink.groupLabel}
                                // >
                                //     <Text>{navbarLink.groupLabel}</Text>
                                //     {navbarLink.links.map((link) => (
                                //         <NavItem
                                //             key={link.label}
                                //             // icon={link.icon}
                                //             // onClick={() => {
                                //             //     setOpened(false);
                                //             //     if (link.url) {
                                //             //         props.history.push(
                                //             //             link.url
                                //             //         );
                                //             //     }
                                //             // }}
                                //         >
                                //             {link.label}
                                //         </NavItem>
                                //     ))}
                                // </Group>
                                <></>
                            );
                        } else {
                            return (
                                <NavItem
                                    key={navbarLink.label}
                                    // icon={navbarLink.icon}
                                    // onClick={() => {
                                    //     setOpened(false);
                                    //     if (navbarLink.url) {
                                    //         props.history.push(navbarLink.url);
                                    //     }
                                    // }}
                                >
                                    {navbarLink.label}
                                </NavItem>
                            );
                        }
                    })}
                </Group>
            </Drawer>
        </>
    );
};
