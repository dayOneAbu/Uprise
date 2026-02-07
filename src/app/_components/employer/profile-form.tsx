"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Loader2, Building, Globe, FileText, Image as ImageIcon, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/app/_components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z.string().min(3, "Company handle must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  logoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EmployerProfileForm() {
  const router = useRouter();

  // Fetch my company
  const { data: company, isLoading, refetch } = api.company.getMine.useQuery();

  // Mutation
  const updateCompany = api.company.update.useMutation({
      onSuccess: () => {
          router.refresh();
          void refetch();
          toast.success("Company profile updated successfully!");
      },
      onError: (err) => {
          toast.error("Error updating profile: " + err.message);
      }
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      slug: "",
      website: "",
      description: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
      if (company) {
          form.reset({
              name: company.name,
              slug: company.slug,
              website: company.website ?? "",
              description: company.description ?? "",
              logoUrl: company.logoUrl ?? "",
          });
      }
  }, [company, form]);

    if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading company details...</p>
            </div>
          </div>
        );
    }

    if (!company) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="p-12 text-center">
                    <div className="text-destructive mb-4">
                        <Building className="h-12 w-12 mx-auto opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Company Not Found</h3>
                    <p className="text-sm text-muted-foreground">
                        We couldn&apos;t find your company profile. Please contact support.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const onSubmit = (data: ProfileFormData) => {
        updateCompany.mutate({
            id: company.id,
            name: data.name,
            slug: data.slug,
            website: data.website ?? undefined,
            description: data.description ?? undefined,
            logoUrl: data.logoUrl ?? undefined,
        });
    }

    return (
        <div className="space-y-6">
            {/* Company Preview Card */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Company Profile Preview
                    </CardTitle>
                    <CardDescription>
                        How your company appears to candidates on Uprise
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        {form.watch("logoUrl") && (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                <Image
                                    src={form.watch("logoUrl") ?? "/placeholder-logo.png"}
                                    alt={form.watch("name") ?? "Company logo"}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground">
                                {form.watch("name") ?? "Company Name"}
                            </h3>
                    <p className="text-muted-foreground mt-1">
                        uprise.com/c/{form.watch("slug") ?? "company-handle"}
                    </p>
                            {form.watch("website") && (
                                <p className="text-sm text-primary mt-1">
                                    {form.watch("website")}
                                </p>
                            )}
                            {form.watch("description") && (
                                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                                    {form.watch("description")}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Edit Company Details
                    </CardTitle>
                    <CardDescription>
                        Update your public company profile and information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Company Name *
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. TechCorp Inc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Handle *</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                                                    uprise.com/c/
                                                </span>
                                                <Input
                                                    placeholder="company-name"
                                                    className="rounded-l-none"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            This will be your company&apos;s unique URL handle
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" />
                                            Website
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.company.com" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: Your company&apos;s main website
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About the Company</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell candidates about your company culture, mission, and what makes you a great place to intern..."
                                                className="min-h-[120px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {field.value?.length ?? 0}/1000 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" />
                                            Logo URL
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/logo.png" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: URL to your company logo image
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-6 border-t">
                                <Button
                                    type="submit"
                                    disabled={updateCompany.isPending}
                                    className="gap-2 min-w-[140px]"
                                >
                                    {updateCompany.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
