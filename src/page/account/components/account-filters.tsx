import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountsFilterProps {
  search: string;
  setSearch: (value: string) => void;
  accountType: string;
  setAccountType: (value: string) => void;
}

export function AccountsFilter({
  search,
  setSearch,
  accountType,
  setAccountType,
}: AccountsFilterProps) {
  return (
    <div className="bg-white p-4 rounded-md border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4"
            />
            <div className="absolute left-3 top-0 h-full flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <Select value={accountType} onValueChange={setAccountType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại tài khoản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
            <SelectItem value="AGENCY">Đại lý</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
