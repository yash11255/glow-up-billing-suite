
import React from "react";

interface InventoryListProps {
  items: any[];
  type: "products" | "services";
}

const InventoryList: React.FC<InventoryListProps> = ({ items, type }) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-card rounded-lg shadow-md p-4 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold">{item.name}</h2>
            {type === "products" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Company: {item.companies?.name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Category: {item.category || "N/A"}
                </p>
              </>
            )}
            {type === "services" && item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
          <div className="mt-2">
            {type === "products" ? (
              <>
                <p className="text-xl font-bold">
                  {item.quantity} {item.unit}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: ₹{item.price || 0}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Duration: {item.duration} minutes
                </p>
                <p className="text-xl font-bold">₹{item.price}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryList;
