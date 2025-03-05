"use client"

import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  shirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL"], {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField 
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={true} {...field}/>
              </FormControl>
              <FormDescription>
                Your name
              </FormDescription>
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
              <FormDescription>
                Your email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Enter the university you attend
              </FormDescription>
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
              <FormControl>
                <Input type="number" className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" {...field} />
              </FormControl>
              <FormDescription>
                Enter your graduation year
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormDescription>
                Please select your preferred t-shirt size for the event.
              </FormDescription>
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
                <Input  
                  type="file" 
                  onChange={e => {
                    field.onChange(e.target?.files ? e.target.files[0] : null);
                  }}
                />
              </FormControl>
              <FormDescription>
                Upload your resume (.pdf, .jpeg, or .png)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline" className="w-full">Submit</Button>
      </form>
    </Form>
  )
}