import { Loader } from "@/app/components/loader"

const Page = () => {
  return (
    <div >
      <div className="w-full max-w-xs">
        <Loader
          variant="table"
          rows={3}
          columns={5}
        />
      </div>

      <div className="w-full max-w-xs">
        <Loader
          variant="text"
          lines={5}
          lineWidths={["w-1/2", "w-1/4", "w-1/2", "w-3/4", "w-4/5"]}
        />
      </div>
    </div>
  )
}
export default Page;
