export default function SupervisorDashboard() {
  return (
    <div className="space-y-8 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Supervisor Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your supervisor dashboard. Manage reviews for your
          business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-2">Pending Reviews</h3>
          <div className="text-3xl font-bold">12</div>
          <p className="text-sm text-muted-foreground mt-2">
            Reviews waiting for your response
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-2">Completed Reviews</h3>
          <div className="text-3xl font-bold">48</div>
          <p className="text-sm text-muted-foreground mt-2">
            Reviews you've addressed
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-2">Average Rating</h3>
          <div className="text-3xl font-bold">4.2 / 5</div>
          <p className="text-sm text-muted-foreground mt-2">
            Your business's current rating
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="font-semibold text-lg">Recent Reviews</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The latest reviews for your business
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="rounded-md border">
            <div className="bg-muted px-4 py-3 text-sm font-medium">
              New Reviews
            </div>
            <div className="divide-y">
              <div className="px-4 py-3 text-sm">
                <div className="font-medium">Sarah J. - ⭐⭐⭐⭐⭐</div>
                <p>
                  Great service and friendly staff! Would definitely recommend.
                </p>
              </div>
              <div className="px-4 py-3 text-sm">
                <div className="font-medium">Michael T. - ⭐⭐⭐</div>
                <p>Average experience. Food was good but service was slow.</p>
              </div>
              <div className="px-4 py-3 text-sm">
                <div className="font-medium">Lisa R. - ⭐⭐⭐⭐</div>
                <p>Loved the atmosphere. Will come back again.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
