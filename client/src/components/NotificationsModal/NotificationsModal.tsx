import {Dispatch, MouseEvent, SetStateAction, useState} from "react";
import {Notification} from "../../store/types/instanceTypes.ts";
import {formatDate} from "../../utils/formatFunctions.ts";
import arrow_back from '../../assets/arrow_back.svg'

type NotificationsModalProps = {
    isNotificationsOpen: boolean;
    setIsNotificationsOpen: Dispatch<SetStateAction<boolean>>;
    notifications: Notification[];
}

export const NotificationsModal = ({isNotificationsOpen, setIsNotificationsOpen, notifications}: NotificationsModalProps) => {
    const [isClosing, setIsClosing] = useState(false);

    const closeModal = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsClosing(true);
        setTimeout(() => {
            setIsNotificationsOpen(false);
            setIsClosing(false);
        }, 300);
    };
    return (<div
            className="absolute z-20 left-0 top-0 md:-top-7 h-[calc(100vh-81px)] md:h-screen w-screen
            md:w-[calc(100vw-60px)] lgg:w-[calc(100vw-244px)] md:left-[48px] lgg:left-[220px]"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.65)'}}
        onClick={closeModal}
    >
        <div className={`bg-white h-[calc(100vh-81px)] md:h-screen md:rounded-r-xl transition-all duration-300
            md:py-5 md:px-6 ${!isNotificationsOpen || isClosing  ?
            "w-0 opacity-0" : "md:w-[397px] w-full opacity-100" }`}
             onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <div className="flex md:hidden justify-between p-3 border-b border-b-gray">
                <img src={arrow_back} alt="Back" onClick={closeModal} />
                <p className="font-semibold">Notifications</p>
                <p></p>
            </div>
            <div className="px-6 md:px-0 py-5 md:py-0">
                <p className="hidden md:block font-semibold text-xl mb-4">Notifications</p>
                <p className="font-semibold mb-4">New</p>
                <div className="flex flex-col gap-5">

                    {notifications.length > 0 && notifications?.map((notification: Notification) => (<div
                        key={notification?._id}
                        className="flex justify-between">
                        <div className="flex gap-3.5">
                            <img src={notification?.actionMaker?.profile_image}
                                 className="w-10 h-10 rounded-[50%] object-cover"
                                 alt="profile_image"/>
                            <p className="w-40">
                                <span className="font-semibold mr-2">{notification?.actionMaker?.username}</span>
                                <span>{notification?.type}</span>
                                <span
                                    className="text-darkgray ml-2">
                                    {formatDate(new Date(notification.createdAt))}</span>
                            </p>
                        </div>
                        {(notification?.post?.photos || notification?.comment?.post?.photos) && (
                            <img src={notification?.post?.photos[0].url ||
                                notification?.comment?.post.photos[0].url}
                                 alt="photo"
                                 className="w-11 h-11 object-cover"/>
                        )}

                    </div>))}
                </div>
            </div>
        </div>
        </div>
    );
};