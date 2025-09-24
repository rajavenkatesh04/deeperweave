const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

/**
 * Skeleton for a single detail item (Icon, Label, Value).
 */
function ProfileDetailItemSkeleton() {
    return (
        <div className="flex items-center p-4 sm:p-5">
            <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="ml-4 flex-grow space-y-2">
                <div className="h-3 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

/**
 * Skeleton for the Account Information card.
 */
function AccountInfoCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            <div className="mt-4 divide-y divide-gray-200 border-t border-gray-200 pt-4 dark:divide-zinc-800 dark:border-zinc-800">
                <ProfileDetailItemSkeleton />
                <ProfileDetailItemSkeleton />
                <ProfileDetailItemSkeleton />
                <ProfileDetailItemSkeleton />
            </div>
        </div>
    );
}

/**
 * Skeleton for the Options card with navigation links.
 */
function OptionsCardSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6 space-y-2">
            <div className="flex w-full items-center gap-4 p-3">
                <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="flex w-full items-center gap-4 p-3">
                <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="flex w-full items-center gap-4 p-3">
                <div className="h-6 w-6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

/**
 * Skeleton for the Danger Zone card.
 */
function DangerZoneCardSkeleton() {
    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="h-6 w-32 rounded-md bg-gray-200" />
            <div className="mt-2 h-4 w-full rounded-md bg-gray-200" />
            <div className="mt-1 h-4 w-4/5 rounded-md bg-gray-200" />
            <div className="mt-4 border-t border-red-500/30 pt-4 dark:border-red-500/20">
                <div className="h-9 w-full rounded-lg bg-gray-200" />
            </div>
        </div>
    );
}

/**
 * The main loading UI for the entire settings page.
 */
export default function Loading() {
    return (
        <main className={`${shimmer} relative overflow-hidden`}>
            <div className="mx-auto space-y-8 py-6">
                <OptionsCardSkeleton />
                <AccountInfoCardSkeleton />
                <DangerZoneCardSkeleton />
            </div>
        </main>
    );
}
