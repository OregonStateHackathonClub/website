"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FileUp } from "lucide-react"

import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formSchema = z.object({
  name: z.string(),
  email: z.string(),
  university: z
    .string()
    .min(1, { message: "University cannot be empty" }),
  graduationYear: z
    .string()
    .min(1, { message: "Graduation year cannot be empty" }),
  shirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"], {
    required_error: "Please select a t-shirt size.",
  }),
  resume: z
    .instanceof(File)
    .optional()
    .refine(file => file !== undefined, "File is required")
    .refine(file => {if (file) {return file.size <= MAX_FILE_SIZE}}, "Max file size is 5MB")
    .refine(file => {if (file) {return ACCEPTED_FILE_TYPES.includes(file.type)}}, "Only .pdf, .jpeg and .png formats are supported"),
})

export const ApplicationForm = ({ 
  name, 
  email,
  defaultValues = {}, 
}: { 
  name: string, 
  email: string, 
  defaultValues?: Partial<z.infer<typeof formSchema>>, 
}) => {
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      email,
      university: "",
      graduationYear: "",
      shirtSize: undefined,
      resume: undefined,
      ...defaultValues
    },
  })

  const onSubmit = async(values: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append("university", values.university)
    formData.append("graduationYear", values.graduationYear)
    formData.append("shirtSize", values.shirtSize)
    formData.append("resume", values.resume!)

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        body: formData
      })
      if (response.ok) {
        router.push("/profile")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({length: 10}, (_, i) => (currentYear + i).toString());

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="space-y-1 bg-muted/50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">BeaverHacks Registration</CardTitle>
          <CardDescription className="text-center">
            Complete your hackathon registration below
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input disabled={true} {...field}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField 
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input disabled={true} {...field}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-medium">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University</FormLabel>
                          <FormControl>
                            <Input placeholder="Oregon State University" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {yearsArray.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-medium">Event Details</h3>
                  <FormField
                    control={form.control}
                    name="shirtSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>T-Shirt Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your t-shirt size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="XS">Extra Small (XS)</SelectItem>
                            <SelectItem value="S">Small (S)</SelectItem>
                            <SelectItem value="M">Medium (M)</SelectItem>
                            <SelectItem value="L">Large (L)</SelectItem>
                            <SelectItem value="XL">Extra Large (XL)</SelectItem>
                            <SelectItem value="XXL">Double XL (XXL)</SelectItem>
                            <SelectItem value="XXXL">Triple XL (XXXL)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField 
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg px-3 py-8 text-center hover:border-muted-foreground/50 transition-colors">
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              onChange={e => {
                                field.onChange(e.target?.files ? e.target.files[0] : null);
                              }}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <div className="flex flex-col items-center gap-2">
                                <FileUp className="h-8 w-8 text-muted-foreground/70" />
                                {!field.value ? (
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload your resume (PDF, JPEG, PNG)
                                  </span>
                                ) : (
                                  <span className="text-sm font-medium">
                                    {field.value.name}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground/70">
                                  Maximum file size: 5MB
                                </span>
                              </div>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end px-0 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!form.formState.isValid || form.formState.isSubmitting}
                >
                  Complete Registration
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}