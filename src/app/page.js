import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

export default function Page() {
  const columnConfig = [
    { key: "title", label: "Title", type: "text", editable: false },
    { key: "description", label: "Description", type: "text", editable: true },
    { key: "price", label: "Price", type: "badge" },
    { key: "mrp", label: "MRP", type: "badge" },
    { key: "discount", label: "Discount (%)", type: "input" },
    { key: "stock", label: "Stock", type: "input" },
    {
      key: "unit",
      label: "Unit",
      type: "select",
      options: ["kg", "g", "L", "ml", "pcs"],
    },
    { key: "weight", label: "Weight", type: "input" },
    { key: "category", label: "Category", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "sku", label: "SKU", type: "text", editable: false },
    { key: "barcode", label: "Barcode", type: "text" },
    { key: "imageUrl", label: "Image", type: "image" },
    { key: "tags", label: "Tags", type: "tags" },
    { key: "isActive", label: "Active", type: "status" },
    { key: "expiryDate", label: "Expiry Date", type: "date" },
    { key: "manufactureDate", label: "MFG Date", type: "date" },
    { key: "shelfLife", label: "Shelf Life", type: "text" },
  ];
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          {/* <DataTable data={data} columnConfig={columnConfig} /> */}
        </div>
      </div>
    </div>
  );
}
