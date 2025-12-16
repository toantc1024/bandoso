import VisitorLogsChartBlock from "@/components/blocks/VisitorLogsChartBlock"

export default function VisitorLogsChartExample() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Visitor Logs Chart Examples</h1>
                <p className="text-muted-foreground">
                    Examples of how to use the VisitorLogsChartBlock component
                </p>
            </div>

            {/* Example 1: Root user view (all areas) */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Root User View - All Areas</h2>
                <VisitorLogsChartBlock
                    areaId="all"
                    title="Thống kê truy cập toàn hệ thống"
                    description="Biểu đồ số lượng khách truy cập toàn hệ thống trong 30 ngày gần đây"
                />
            </div>

            {/* Example 2: Admin user view (specific area) */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Admin User View - Specific Area</h2>
                <VisitorLogsChartBlock
                    areaId="admin-account-id-123"
                    title="Thống kê truy cập khu vực"
                    description="Biểu đồ số lượng khách truy cập khu vực trong 30 ngày gần đây"
                />
            </div>

            {/* Example 3: Compact view */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Compact View</h2>
                <VisitorLogsChartBlock
                    areaId="demo-area"
                    title="Truy cập"
                    description="Thống kê 30 ngày"
                />
            </div>
        </div>
    )
}
