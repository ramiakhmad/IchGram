import {useEffect, useRef, useState} from "react";
import {Link} from "react-router";
import { getRandomPosts} from "../../utils/apiCalls/postApi.ts";
import {Post} from "../../store/types/instanceTypes.ts";
import useScrollToTop from "../../utils/customHooks.ts";
import {SearchPageSkeleton} from "../../skeletons/SearchPageSkeleton.tsx";

export const ExplorePage = () => {
    const [photos, setPhotos] = useState<Post[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    useScrollToTop();

    const loadPosts = async (): Promise<void> => {
        try {
            if (isFetching) return; // Prevent redundant fetches
            setIsFetching(true); // Set fetching state to true
            const fetchCount = window.innerHeight > window.innerWidth && photos.length === 0 ? 20 : 10;
            const result: Post[] = await getRandomPosts(fetchCount);

            // Update photos state and remove duplicates
            setPhotos((prevPosts) => [...prevPosts, ...result]);

            setIsFetching(false);
            setIsInitialLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (isInitialLoading) {
            loadPosts(); // Trigger loading posts initially
        }

        // Initialize the IntersectionObserver
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    loadPosts(); // Trigger loading more posts
                }
            },
            { threshold: 1.0 }
        );

        const ref = loadMoreRef.current;

        if (ref) observer.observe(ref);

        return () => {
            if (ref) observer.unobserve(ref);
        };
    }, [photos]);

    const getBlocks = () => {
        const blocks = [];
        for (let i = 0; i < photos.length; i += 5) {
            const blockPhotos = photos.slice(i, i + 5);
            blocks.push(blockPhotos);
        }
        return blocks;
    };

    // Skeleton
    if (isInitialLoading) return <SearchPageSkeleton/>;

    return (
        <div className="flex flex-col md:mx-auto md:my-20 m-2 gap-2
        lgg:max-w-[989px] lg:max-w-[820px] md:max-w-[640px]">
            {getBlocks().map((block: Post[], blockIndex: number) => (
                <div
                    key={blockIndex}
                    className="grid grid-cols-3 grid-flow-col gap-2"
                >
                    {block.map((post: Post, postIndex: number) => (
                        <Link
                            to={`/post/${post._id}`}
                            key={postIndex}
                            className={`
                                ${(blockIndex % 2 === 0 && postIndex === 0) ||
                            (blockIndex % 2 !== 0 && postIndex === 4)
                                ? "row-span-2"
                                : "lgg:h-[316px] lg:h-[280px] md:h-[200px] aspect-square"} cursor-pointer
                            `}
                        >
                            <img
                                src={post.photos[0].url}
                                alt="Photo"
                                className="w-full h-full object-cover"
                            />
                        </Link>
                    ))}
                </div>
            ))}
            {/* Load more trigger */}
            <div ref={loadMoreRef} className="load-more-trigger h-2"></div>
        </div>
    );
};