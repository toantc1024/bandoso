import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

// Mock data for places - replace with actual data fetching
const mockPlaces = [
  {
    id: "1",
    name: "Địa điểm 1",
    description: "Mô tả địa điểm 1",
    hotspots: 5,
  },
  {
    id: "2",
    name: "Địa điểm 2",
    description: "Mô tả địa điểm 2",
    hotspots: 3,
  },
  {
    id: "3",
    name: "Địa điểm 3",
    description: "Mô tả địa điểm 3",
    hotspots: 8,
  },
];

const ManagePlacesPage = () => {
  const navigate = useNavigate();

  const handlePlaceClick = (placeId: string) => {
    navigate(`/quan-ly/dia-diem/${placeId}/thong-tin`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Địa điểm
          </h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa điểm mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPlaces.map((place) => (
          <Card
            key={place.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => handlePlaceClick(place.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                {place.name}
              </CardTitle>
              <CardDescription>{place.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {place.hotspots} hotspot{place.hotspots !== 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManagePlacesPage;
