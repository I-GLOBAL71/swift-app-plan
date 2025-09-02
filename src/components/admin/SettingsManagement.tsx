import { ApiSettings } from "./ApiSettings";
import { PromptsManagement } from "./PromptsManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bot } from "lucide-react";

export function SettingsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paramètres du Système</h2>
        <p className="text-muted-foreground">
          Configurez les paramètres généraux de l'application
        </p>
      </div>
      
      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration API
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Prompts IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <ApiSettings />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}