import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "wouter";
import introVideo from "@assets/Create_a_cinematic_logo_reveal_animation_featuring_the_provide_1766131297823.mp4";
import heroVideo from "@assets/Create_a_seamless,_loopable_animated_video_based_on_the_refere_1766172802666.mp4";
import logoTransparent from "@assets/HiveCraft_Digital_Logo_Transparent.png";

const subscribeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

type SubscribeForm = z.infer<typeof subscribeSchema>;

function FloatingHexagon({ delay, duration, startX, startY }: { delay: number; duration: number; startX: number; startY: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ x: startX, y: startY, opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{
        x: [startX, startX + 50, startX - 30, startX + 20, startX],
        y: [startY, startY - 80, startY - 160, startY - 240, startY - 320],
        opacity: [0, 0.6, 0.8, 0.6, 0],
        scale: [0.5, 0.8, 1, 0.8, 0.5],
        rotate: [0, 30, -20, 45, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="60" height="70" viewBox="0 0 60 70" className="text-primary/30">
        <polygon
          points="30,2 55,18 55,52 30,68 5,52 5,18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polygon
          points="30,10 48,22 48,48 30,60 12,48 12,22"
          fill="currentColor"
          opacity="0.2"
        />
      </svg>
    </motion.div>
  );
}

function DigitalBee({ delay, path }: { delay: number; path: { x: number[]; y: number[] } }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ x: path.x[0], y: path.y[0], opacity: 0 }}
      animate={{
        x: path.x,
        y: path.y,
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-primary">
          <ellipse cx="12" cy="12" rx="6" ry="4" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="4" ry="2.5" fill="#000" opacity="0.3" />
          <circle cx="8" cy="12" r="2" fill="currentColor" />
          <motion.ellipse
            cx="14"
            cy="8"
            rx="4"
            ry="2"
            fill="currentColor"
            opacity="0.4"
            animate={{ ry: [2, 3, 2], rx: [4, 5, 4] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          <motion.ellipse
            cx="14"
            cy="16"
            rx="4"
            ry="2"
            fill="currentColor"
            opacity="0.4"
            animate={{ ry: [2, 3, 2], rx: [4, 5, 4] }}
            transition={{ duration: 0.1, repeat: Infinity, delay: 0.05 }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function AnimatedBackground() {
  const hexagons = [
    { delay: 0, duration: 8, startX: 100, startY: 600 },
    { delay: 1.5, duration: 10, startX: 300, startY: 700 },
    { delay: 3, duration: 9, startX: 500, startY: 650 },
    { delay: 0.5, duration: 11, startX: 700, startY: 720 },
    { delay: 2, duration: 8.5, startX: 900, startY: 680 },
    { delay: 4, duration: 10, startX: 1100, startY: 750 },
    { delay: 1, duration: 9.5, startX: 200, startY: 800 },
    { delay: 2.5, duration: 8, startX: 600, startY: 780 },
    { delay: 3.5, duration: 11, startX: 1000, startY: 700 },
    { delay: 0.8, duration: 9, startX: 400, startY: 850 },
  ];

  const beePaths = [
    { delay: 0, path: { x: [50, 200, 400, 350, 500, 300, 50], y: [300, 250, 280, 200, 150, 100, 50] } },
    { delay: 3, path: { x: [800, 600, 700, 500, 400, 350, 200], y: [400, 350, 300, 320, 250, 180, 100] } },
    { delay: 6, path: { x: [1200, 1000, 800, 900, 700, 600, 500], y: [500, 400, 380, 300, 250, 200, 120] } },
    { delay: 2, path: { x: [300, 450, 600, 550, 700, 800, 1000], y: [600, 500, 450, 380, 320, 250, 150] } },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {hexagons.map((hex, i) => (
        <FloatingHexagon key={i} {...hex} />
      ))}
      {beePaths.map((bee, i) => (
        <DigitalBee key={i} {...bee} />
      ))}
    </div>
  );
}

export default function IntroExperience() {
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const isReplayMode = searchString.includes("replay=true");

  const form = useForm<SubscribeForm>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscribeForm) => {
      const response = await apiRequest("POST", "/api/subscriptions", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Success!",
        description: "We'll send you details about HIVE SITE soon.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscribeForm) => {
    subscribeMutation.mutate(data);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVideoEnd = () => {
        setVideoEnded(true);
        if (isReplayMode) {
          setLocation("/home");
        } else {
          setShowModal(true);
        }
      };
      video.addEventListener("ended", handleVideoEnd);
      return () => video.removeEventListener("ended", handleVideoEnd);
    }
  }, [isReplayMode, setLocation]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="fixed inset-0 bg-black z-0" />
      
      {videoEnded && !isReplayMode && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-[5]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`fixed inset-0 w-full h-full object-contain z-10 ${videoEnded ? 'opacity-0' : 'opacity-100'}`}
        data-testid="video-intro"
      >
        <source src={introVideo} type="video/mp4" />
      </video>

      {videoEnded && !isReplayMode && <AnimatedBackground />}

      {videoEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setShowModal(true)}
              className="gap-2 min-w-[200px]"
              data-testid="button-subscribe"
            >
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Get Started
              </motion.span>
            </Button>
            <Link href="/home">
              <Button size="lg" variant="outline" data-testid="button-explore">
                Explore HiveCraft
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by HiveCraft Digital
          </p>
        </motion.div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <>
          {showModal && videoEnded && (
            <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={logoTransparent}
                  alt=""
                  className="w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px]"
                  animate={{
                    opacity: [0.4, 0.55, 0.35, 0.6, 0.4, 0.5, 0.45, 0.4],
                    x: [0, -2, 3, -1, 2, 0, -3, 0],
                    y: [0, 1, -2, 0, 1, -1, 2, 0],
                    scale: [1, 1.002, 0.998, 1.001, 0.999, 1, 1.003, 1],
                    filter: [
                      "hue-rotate(0deg) brightness(1)",
                      "hue-rotate(10deg) brightness(1.2)",
                      "hue-rotate(-5deg) brightness(0.9)",
                      "hue-rotate(0deg) brightness(1.1)",
                      "hue-rotate(15deg) brightness(0.95)",
                      "hue-rotate(-10deg) brightness(1.15)",
                      "hue-rotate(5deg) brightness(1)",
                      "hue-rotate(0deg) brightness(1)",
                    ],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                    times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
                  }}
                />
                <motion.img
                  src={logoTransparent}
                  alt=""
                  className="absolute inset-0 w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] mix-blend-screen"
                  style={{ filter: "hue-rotate(180deg)" }}
                  animate={{
                    opacity: [0, 0.2, 0, 0.15, 0, 0.25, 0],
                    x: [0, 4, -2, 5, -3, 2, 0],
                    y: [0, -2, 3, -1, 2, -3, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                />
              </motion.div>
            </div>
          )}
        <DialogContent className="sm:max-w-md border-primary/30 z-50 p-4 sm:p-6">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/10"
                style={{ left: `${i * 35}%`, top: `${(i % 2) * 40 + 20}%` }}
                animate={{
                  y: [-8, 8, -8],
                  rotate: [0, 8, 0],
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              >
                <svg width="30" height="35" viewBox="0 0 60 70">
                  <polygon
                    points="30,2 55,18 55,52 30,68 5,52 5,18"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
            ))}
          </div>
          
          <DialogHeader className="relative z-10 space-y-1">
            <DialogTitle className="text-xl sm:text-2xl font-heading text-center">
              <span className="text-gold-gradient">Subscribe Now</span>
            </DialogTitle>
            <DialogDescription className="text-center space-y-1">
              {submitted ? (
                "Thank you! We'll email you soon with all the details about HIVE SITE."
              ) : (
                <>
                  <span className="block text-base sm:text-lg">
                    Get started with your <span className="font-semibold text-primary">HIVE SITE</span>
                  </span>
                  <span className="block text-xl sm:text-2xl font-bold mt-1">
                    <span className="text-muted-foreground line-through mr-2">$1,500</span>
                    <span className="text-primary">$500</span>
                  </span>
                  <span className="block text-xs sm:text-sm text-muted-foreground">
                    Limited time - Save $1,000!
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {!submitted ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 space-y-3 mt-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="h-9"
                  {...form.register("name")}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-9"
                  {...form.register("email")}
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="h-9"
                  {...form.register("phone")}
                  data-testid="input-phone"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={subscribeMutation.isPending}
                data-testid="button-submit"
              >
                {subscribeMutation.isPending ? "Submitting..." : "Claim Your HIVE SITE - $500"}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center py-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <svg width="32" height="38" viewBox="0 0 60 70" className="text-primary">
                  <polygon
                    points="30,2 55,18 55,52 30,68 5,52 5,18"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
              <p className="text-lg font-medium">You're in!</p>
              <p className="text-muted-foreground text-sm mt-1">Check your inbox soon.</p>
              <Link href="/home">
                <Button
                  className="mt-4"
                  data-testid="button-explore-hive"
                >
                  EXPLORE THE HIVE
                </Button>
              </Link>
            </motion.div>
          )}
        </DialogContent>
        </>
      </Dialog>
    </div>
  );
}
