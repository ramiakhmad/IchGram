import {useState} from "react";
import {Link, useLocation} from "react-router";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import links from "./navLinks.ts";
import logo from "../../assets/logo.svg";
import ich from "../../assets/nav_icons/ich.png"
import default_profile_pic from "../../assets/default_profile_pic.png";
import {CreatePost} from "../CreatePost/CreatePost.tsx";
import {NotificationsModal} from "../NotificationsModal/NotificationsModal.tsx";
import {SearchModal} from "../SearchModal/SearchModal.tsx";
import {useFetchUserAfterReload} from "../../utils/customHooks.ts";

export const Navigation = () => {
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.user);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
    const location = useLocation();
    useFetchUserAfterReload(user);

    return (
        <div className="z-20 bg-white flex justify-center md:border-r border-t md:border-t-0 border-gray
         py-7 lgg:px-4 min-w-full md:min-w-[60px] lgg:min-w-[244px]"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div
                className="flex justify-around w-full md:w-fit mx-10 md:mx-0
                 md:justify-start md:fixed top-7 md:flex-col items-center gap-4 min-w-[60px]">

                <Link to='/' className="hidden md:flex">
                    <img src={logo}
                         alt="logo"
                         className="hidden lgg:block"/>
                    <img src={ich}
                         alt="logo small"
                         className="block lgg:hidden"/>
                </Link>
                <div className="flex md:flex-col items-center justify-around
                lgg:md:items-start lgg:px-2 gap-4 md:mt-6 min-w-full">
                    <Link
                        to={links[0].href}
                        className="mx-auto lgg:mx-0"
                    >
                        <div className="flex gap-4"
                             onMouseOver={() => setHoveredLink(links[0].name)}
                             onMouseLeave={() => setHoveredLink(null)}>
                            <img
                                src={hoveredLink === links[0].name || location.pathname === '/' ?
                                    links[0].logoFill : links[0].logo}
                                alt={links[0].name}
                            />
                            <span className="hidden lgg:block">{links[0].name}</span>
                        </div>
                    </Link>
                    <div className="hidden md:flex lgg:gap-4 flex-col lgg:flex-row items-center cursor-pointer"
                         onClick={() => setIsSearchOpen(!isSearchOpen)}
                         onMouseOver={() => setHoveredLink(links[1].name)}
                         onMouseLeave={() => setHoveredLink(null)}>
                        <img
                            src={hoveredLink === links[1].name ? links[1].logoFill : links[1].logo}
                            alt={links[1].name}
                        />
                        <span className="hidden lgg:block">Search</span>
                        <div className={isSearchOpen ? "opacity-100" : "opacity-0 invisible"}>
                            <SearchModal isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}/>
                        </div>
                    </div>
                    <Link
                        to={links[2].href}
                        className="mx-auto lgg:mx-0"
                    >
                        <div className="flex gap-4 cursor-pointer"
                             onMouseOver={() => setHoveredLink(links[2].name)}
                             onMouseLeave={() => setHoveredLink(null)}>
                            <img
                                src={hoveredLink === links[2].name ? links[2].logoFill : links[2].logo}
                                alt={links[2].name}
                            />
                            <span className="hidden lgg:block">{links[2].name}</span>
                        </div>
                    </Link>
                    <Link to="/messages" className="flex gap-4 cursor-pointer mx-auto lgg:mx-0"
                          onMouseOver={() => setHoveredLink(links[3].name)}
                          onMouseLeave={() => setHoveredLink(null)}>
                        <img
                            src={
                                hoveredLink === links[3].name || location.pathname.startsWith('/messages')
                                    ? links[3].logoFill
                                    : links[3].logo
                            }
                            alt={links[3].name}
                        />
                        <span className="hidden lgg:block">Messages</span>
                    </Link>
                    <div className="hidden md:flex lgg:gap-4 flex-col lgg:flex-row items-center cursor-pointer"
                         onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                         onMouseOver={() => setHoveredLink(links[4].name)}
                         onMouseLeave={() => setHoveredLink(null)}>
                        <img
                            src={hoveredLink === links[4].name ? links[4].logoFill : links[4].logo}
                            alt={links[4].name}
                        />
                        <span className="hidden lgg:block">Notifications</span>
                        <div className={`z-20 ${isNotificationsOpen ? "opacity-100" : "opacity-0 invisible"}`}>
                            <NotificationsModal
                                isNotificationsOpen={isNotificationsOpen}
                                setIsNotificationsOpen={setIsNotificationsOpen}
                                notifications={user?.notifications}/>
                        </div>
                    </div>
                    <div className="flex lgg:gap-4 flex-col lgg:flex-row items-center cursor-pointer mx-auto lgg:mx-0"
                         onClick={() => setIsCreatePostOpen(!isCreatePostOpen)}
                         onMouseOver={() => setHoveredLink(links[5].name)}
                         onMouseLeave={() => setHoveredLink(null)}>
                        <img
                            src={hoveredLink === links[5].name ? links[5].logoFill : links[5].logo}
                            alt={links[5].name}
                            className="cursor-pointer"
                        />
                        <span className="cursor-pointer hidden lgg:block">Create</span>
                        <div className={isCreatePostOpen ? "opacity-100" : "opacity-0 invisible"}>
                            <CreatePost userId={user?._id}
                                        username={user?.username}
                                        profileImage={user?.profile_image}
                                        setIsCreatePostOpen={setIsCreatePostOpen}
                            />
                        </div>
                    </div>
                    <Link
                        to={`profile/${user?.username}`}
                        className="mx-auto lgg:mx-0"
                    >
                        <div className="flex items-center gap-4 md:mt-12">
                            <img
                                src={user?.profile_image || default_profile_pic}
                                alt="Profile image"
                                className="w-6 h-6 object-cover rounded-[50%] border border-gray"
                            />
                            <span className="font-semibold hidden lgg:block">Profile</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}