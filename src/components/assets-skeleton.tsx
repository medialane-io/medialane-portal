import { Skeleton } from "@/src/components/ui/skeleton"

export function AssetsSkeleton() {
    return (
        <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">

            <div className="flex flex-col items-center text-center mb-6 md:mb-10 animate-pulse">
                <Skeleton className="h-8 w-64 rounded-full mb-3" />
                <Skeleton className="h-10 md:h-14 w-3/4 md:w-1/2 mb-3" />
                <Skeleton className="h-4 md:h-6 w-full md:w-2/3 max-w-2xl mb-5" />
                <div className="flex gap-3 mt-5">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-36 rounded-full" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto mb-4 md:mb-6">
                <div className="flex flex-col gap-3 p-3 md:p-4 rounded-xl border border-white/10 bg-zinc-900/50">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

                        <Skeleton className="h-10 w-full md:w-[420px] rounded-md" />

                        <div className="flex items-center gap-2 md:gap-3">
                            <Skeleton className="h-10 w-[160px] rounded-md" />
                            <div className="flex gap-1">
                                <Skeleton className="h-9 w-9 rounded-md" />
                                <Skeleton className="h-9 w-9 rounded-md" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[300px] w-full rounded-xl" />
                            <div className="space-y-2 px-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-1/2" />
                                    <Skeleton className="h-5 w-1/4" />
                                </div>
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
