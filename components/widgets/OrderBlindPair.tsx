"use client";

// The same four words in two orders, read by every rule on the page.
//
// One sentence says the crew sails the boat and the other says the boat sails
// the crew, and every rule here answers the same position for both, so the two
// coordinates are printed side by side and the largest disagreement between them
// is reported next to the angle. The API pools both orderings; the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError, Order, fetchOrder } from "@/lib/concepts/pooling-a-text";
import { Legend, Stat, Waiting } from "./poolingATextShared";

function gapText(value: number): string {
  return value === 0 ? "0" : value.toExponential(1).replace("e-", "e−");
}

export function OrderBlindPair() {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchOrder();
        if (!cancelled) {
          setOrder(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!order) return <Waiting message={message} />;

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Stat label="the first sentence" value={order.first} />
        <Stat label="the second sentence" value={order.second} />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1 pr-3 font-medium">rule</th>
              <th className="py-1 pr-3 font-medium">the first, as numbers</th>
              <th className="py-1 pr-3 font-medium">the second, as numbers</th>
              <th className="py-1 pr-3 font-medium">largest gap</th>
              <th className="py-1 font-medium">angle between them</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px]">
            {order.rows.map((row) => (
              <tr
                key={row.method}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1.5 pr-3 font-sans text-slate-600 dark:text-slate-300">
                  {row.method_label}
                </td>
                <td className="py-1.5 pr-3 text-slate-500 dark:text-slate-400">
                  {row.first_vector.length > 8
                    ? `${row.first_vector.length} numbers`
                    : `(${row.first_vector.map((value) => value.toFixed(4)).join(", ")})`}
                </td>
                <td className="py-1.5 pr-3 text-slate-500 dark:text-slate-400">
                  {row.second_vector.length > 8
                    ? `${row.second_vector.length} numbers`
                    : `(${row.second_vector.map((value) => value.toFixed(4)).join(", ")})`}
                </td>
                <td className="py-1.5 pr-3 text-slate-900 dark:text-slate-100">
                  {gapText(row.largest_gap)}
                </td>
                <td className="py-1.5 text-slate-900 dark:text-slate-100">
                  {row.similarity.toFixed(12)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        Four words can be written in {order.n_orderings} orders and every one of
        them lands on the same position. Under the two counting rules the two
        lists of numbers agree in every bit; under the averaging rules the
        largest disagreement between them first shows in the seventeenth decimal
        place, which is the order the additions happened in rather than a
        difference in the answer, and the angle is one to twelve decimal places
        either way.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
