const measurements = [
  ["S", "24.80", "22.44", "24.41", "22.44"],
  ["M", "25.39", "23.23", "25.20", "22.83"],
  ["L", "25.98", "24.02", "25.98", "23.23"],
  ["XL", "26.57", "24.80", "26.77", "23.62"],
  ["2XL", "27.17", "25.59", "27.56", "24.02"],
];

export function SizeGuide() {
  return (
    <details className="group mt-3 rounded-lg border border-border text-sm">
      <summary className="cursor-pointer rounded-lg px-3 py-2.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        Size guide
      </summary>
      <div className="px-3 pb-3">
        <p className="mb-2 text-xs text-muted-foreground">All measurements in inches.</p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs sm:text-sm tabular-nums">
            <caption className="sr-only">Hoodie size measurements in inches</caption>
            <thead className="bg-muted text-muted-foreground">
              <tr>
                {["Size", "Length", "Shoulder", "Chest", "Sleeve length"].map((label) => (
                  <th key={label} scope="col" className="px-2 py-2 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measurements.map(([size, ...values]) => (
                <tr key={size} className="border-t border-border">
                  <th scope="row" className="px-2 py-2 font-medium">{size}</th>
                  {values.map((value, index) => (
                    <td key={index} className="px-2 py-2">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
