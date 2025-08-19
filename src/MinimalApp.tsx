
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MinimalApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marketing Campaign Planner</h1>
      <Card>
        <CardContent className="p-4">
          <p>Application is working!</p>
          <Button onClick={() => console.log('Button clicked')}>
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}