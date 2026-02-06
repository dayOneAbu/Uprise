import { api, HydrateClient } from "~/trpc/server";

export default async function ContractsPage() {
  const contracts = await api.contract.listMyContracts();

  return (
    <HydrateClient>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Active Contracts</h1>

        <div className="grid gap-4">
          {contracts.length === 0 ? (
            <p className="text-gray-500">No active contracts found.</p>
          ) : (
            contracts.map((contract) => (
              <div key={contract.id} className="rounded border bg-white p-4 shadow-sm flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-semibold">{contract.job?.title ?? "Unknown Job"}</h2>
                   <p className="text-sm text-gray-500">
                     Intern: <span className="font-medium text-gray-900">{(contract.intern as { name?: string })?.name ?? "Unknown"}</span>
                   </p>
                   <p className="text-xs text-gray-400">
                     Started: {contract.startDate?.toLocaleDateString()}
                   </p>
                </div>
                <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                        contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' :
                        contract.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                        {contract.status}
                    </span>
                    {contract.status === 'ACTIVE' && (
                        <div className="mt-2">
                             {/* Placeholder for 'End Contract' button - usually requires a dedicated page or modal */}
                             <span className="text-xs text-blue-600 cursor-not-allowed" title="Implement detail view to end">Manage &rarr;</span>
                        </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </HydrateClient>
  );
}
