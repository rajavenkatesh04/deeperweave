export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ error: string }>;
}) {
    const params = await searchParams;

    return (
        <div>
            <h1>Sorry, something went wrong.</h1>
            <div>
                {params?.error ? (
                    <p className="text-sm text-muted-foreground">
                        Code error: {params.error}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        An unspecified error occurred.
                    </p>
                )}
            </div>
        </div>
    );
}