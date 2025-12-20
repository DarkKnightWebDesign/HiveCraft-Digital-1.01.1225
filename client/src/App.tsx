import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

import IntroExperience from "@/pages/intro";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Process from "@/pages/process";
import Pricing from "@/pages/pricing";
import Portfolio from "@/pages/portfolio";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

import PortalDashboard from "@/pages/portal/dashboard";
import PortalProjects from "@/pages/portal/projects";
import ProjectDetail from "@/pages/portal/project-detail";
import PortalMessages from "@/pages/portal/messages";
import PortalFiles from "@/pages/portal/files";
import PortalBilling from "@/pages/portal/billing";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminProjects from "@/pages/admin/projects";

function Router() {
  return (
    <Switch>
      <Route path="/" component={IntroExperience} />
      <Route path="/home" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/process" component={Process} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      <Route path="/portal" component={PortalDashboard} />
      <Route path="/portal/dashboard" component={PortalDashboard} />
      <Route path="/portal/projects" component={PortalProjects} />
      <Route path="/portal/projects/:id" component={ProjectDetail} />
      <Route path="/portal/messages" component={PortalMessages} />
      <Route path="/portal/files" component={PortalFiles} />
      <Route path="/portal/billing" component={PortalBilling} />
      
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/projects/:id" component={ProjectDetail} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
