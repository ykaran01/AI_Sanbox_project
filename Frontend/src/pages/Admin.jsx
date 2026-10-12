import { useEffect, useState  } from "react";
import { toast } from "sonner";
import { RefreshCw ,ArrowLeftIcon } from "lucide-react";
import { getMetrics } from "@/services/service";
import { useContext } from "react"
import { UserConetxt } from "./UserProvider.jsx";
import { useNavigate } from "react-router-dom";
const Admin = () => {
    const {user} = useContext(UserConetxt);
   
    const navigate = useNavigate();
    useEffect(()=>{
        if(!user || user?.email !== import.meta.env.VITE_ADMIN_EMAIL){
          toast.error("Unauthorized access");
          navigate('/')
        }
  },[])
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await getMetrics();
      setMetrics(response.data);
    } catch (error) {
      toast.error("Failed to fetch metrics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricRows = metrics? [
        ["Total Executions", metrics.total],
        ["Successful Executions", metrics.success],
        ["Failed Executions", metrics.failed],
        [
          "Success Rate",
          metrics.total
            ? `${((metrics.success / metrics.total) * 100).toFixed(2)}%`
            : "0%",
        ],
        [
          "Average Execution Time",
          `${Number(metrics.averageExecution).toFixed(2)} ms`,
        ],
        [
          "Average Attempts",
          Number(metrics.averageattemps).toFixed(2),
        ],
        ["Message Requests", metrics.numMessage],
        ["Code Execution Requests", metrics.numCode],
]: [];

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading metrics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <ArrowLeftIcon onClick={()=>{
            navigate(-1)
        }} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              AI Sandbox execution metrics
            </p>
          </div>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 hover:bg-indigo-500 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Executions",
              value: metrics?.total ?? 0,
            },
            {
              label: "Successful",
              value: metrics?.success ?? 0,
            },
            {
              label: "Failed",
              value: metrics?.failed ?? 0,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="text-lg font-semibold">Execution Statistics</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-600/70 text-slate-300">
                <tr>
                  <th className="px-5 py-4 font-medium">Metric</th>
                  <th className="px-5 py-4 font-medium">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {metricRows.map(([label, value]) => (
                  <tr
                    key={label}
                    className="transition-colors hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-4 text-slate-300">{label}</td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
