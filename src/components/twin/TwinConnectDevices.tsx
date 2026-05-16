import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, Monitor, MessageCircle, QrCode, Link2,
  Check, Copy, ExternalLink, Loader2, Code,
  Globe, Share2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface TwinConnectDevicesProps {
  twinId: string;
  twinName: string;
}

const TwinConnectDevices = ({ twinId, twinName }: TwinConnectDevicesProps) => {
  const { toast } = useToast();
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookConnected, setWebhookConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const twinUrl = `${window.location.origin}/chat/${twinId}`;
  const twinEmbedCode = `<iframe src="${twinUrl}" width="400" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "تم", description: "تم النسخ إلى الحافظة" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "خطأ", description: "فشل النسخ", variant: "destructive" });
    }
  };

  const handleWhatsappConnect = () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم واتساب صحيح", variant: "destructive" });
      return;
    }
    setWhatsappConnected(true);
    toast({ title: "تم", description: `سيتم إرسال رابط التوأم إلى ${whatsappNumber}` });
    const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً! توأمي الرقمي ينتظرك هنا: ${twinUrl}`)}`;
    window.open(waUrl, "_blank");
  };

  const handleWebhookConnect = () => {
    if (!webhookUrl) {
      toast({ title: "خطأ", description: "يرجى إدخال رابط Webhook", variant: "destructive" });
      return;
    }
    setWebhookConnected(true);
    toast({ title: "تم", description: "تم ربط Webhook بنجاح" });
  };

  const openWhatsAppChat = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`تحدث مع توأمي الرقمي: ${twinUrl}`)}`;
    window.open(waUrl, "_blank");
  };

  const platforms = [
    {
      id: "web",
      name: "رابط ويب",
      icon: Globe,
      desc: "شارك رابط التوأم مع任何人",
      action: () => copyToClipboard(twinUrl),
      actionLabel: "نسخ الرابط",
      preview: twinUrl,
    },
    {
      id: "embed",
      name: "تضمين في موقع",
      icon: Code,
      desc: "أضف التوأم إلى موقعك كـ widget",
      action: () => copyToClipboard(twinEmbedCode),
      actionLabel: "نسخ الكود",
      preview: twinEmbedCode.substring(0, 60) + "...",
    },
    {
      id: "mobile",
      name: "تطبيق جوال",
      icon: Smartphone,
      desc: "أضف التوأم إلى شاشتك الرئيسية",
      action: () => {
        toast({ title: "قريباً", description: "تطبيق الجوال قيد التطوير" });
      },
      actionLabel: "قريباً",
      preview: "iOS • Android",
    },
    {
      id: "desktop",
      name: "تطبيق حاسوب",
      icon: Monitor,
      desc: "استخدم التوأم على سطح المكتب",
      action: () => {
        toast({ title: "قريباً", description: "تطبيق سطح المكتب قيد التطوير" });
      },
      actionLabel: "قريباً",
      preview: "Windows • Mac • Linux",
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">ربط التوأم الرقمي</h2>
        <p className="text-muted-foreground">اربط توأمك الرقمي بالأجهزة والمنصات المختلفة</p>
      </div>

      <Tabs defaultValue="share" className="space-y-6">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> مشاركة وربط
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> واتساب
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Webhook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share">
          <div className="grid sm:grid-cols-2 gap-4">
            {platforms.map(platform => (
              <Card key={platform.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <platform.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground">{platform.name}</h4>
                    <p className="text-sm text-muted-foreground">{platform.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{platform.preview}</p>
                    <Button variant="hero" size="sm" className="mt-3" onClick={platform.action}>
                      {platform.actionLabel === "نسخ الرابط" || platform.actionLabel === "نسخ الكود" ? (
                        <>{copied ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}{platform.actionLabel}</>
                      ) : platform.actionLabel}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* QR Code */}
          <Card className="glass-card rounded-2xl p-6 text-center mt-4">
            <h3 className="font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> رمز QR للتوأم
            </h3>
            <p className="text-sm text-muted-foreground mb-4">امسح الرمز لفتح المحادثة مع توأمك الرقمي</p>
            <div ref={qrCanvasRef} className="flex justify-center">
              <div className="w-48 h-48 rounded-2xl bg-white flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twinUrl)}`}
                  alt="QR Code"
                  className="w-44 h-44"
                />
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => copyToClipboard(twinUrl)}>
              <Download className="w-4 h-4 ml-2" /> تحميل QR
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">واتساب شخصي</h3>
                  <p className="text-sm text-muted-foreground">شارك التوأم عبر واتساب</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">رقم الهاتف</label>
                  <Input
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="例如: 966577984640"
                    dir="ltr"
                  />
                </div>
                <Button onClick={handleWhatsappConnect} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  {whatsappConnected ? "إعادة الإرسال" : "إرسال رابط التوأم"}
                </Button>
                {whatsappConnected && (
                  <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500 w-full justify-center">
                    <Check className="w-3 h-3 ml-1" /> متصل
                  </Badge>
                )}
              </div>
            </Card>

            <Card className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">واتساب أعمال</h3>
                  <p className="text-sm text-muted-foreground">للمتاجر والشركات</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">مميزات واتساب أعمال:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>ردود تلقائية ذكية</li>
                    <li>قوالب رسائل مخصصة</li>
                    <li>إحصائيات المحادثات</li>
                    <li>فريق دعم متعدد</li>
                  </ul>
                </div>
                <Button variant="hero" className="w-full" onClick={openWhatsAppChat}>
                  <ExternalLink className="w-4 h-4 ml-2" /> فتح واتساب
                </Button>
                <p className="text-xs text-muted-foreground text-center">ميزة واتساب أعمال الرسمية قادمة قريباً عبر WhatsApp Cloud API</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhook">
          <Card className="glass-card rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" /> Webhook للتكامل
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              استخدم Webhook لربط توأمك الرقمي بأي تطبيق خارجي. سيتم إرسال جميع المحادثات إلى الرابط الذي تحدده.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <p className="text-2xl font-bold text-primary">Webhook</p>
                <p className="text-xs text-muted-foreground">استقبال البيانات</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <p className="text-2xl font-bold text-primary">JSON</p>
                <p className="text-xs text-muted-foreground">تنسيق البيانات</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <p className="text-2xl font-bold text-primary">POST</p>
                <p className="text-xs text-muted-foreground">طريقة الطلب</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                dir="ltr"
                className="flex-1"
              />
              <Button onClick={handleWebhookConnect} variant="hero" disabled={webhookConnected}>
                {webhookConnected ? <><Check className="w-4 h-4 ml-2" /> متصل</> : <><Link2 className="w-4 h-4 ml-2" /> ربط</>}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TwinConnectDevices;