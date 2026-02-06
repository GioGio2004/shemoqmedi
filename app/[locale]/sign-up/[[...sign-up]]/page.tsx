"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-[0.35em] uppercase">
           shemoqmedi
          </h1>
          <p className="text-xs text-white/60">
            Create your account
          </p>
        </div>

        <SignUp.Root>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <>
                {/* STEP: START */}
                <SignUp.Step name="start">
                  <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-medium">
                        Get started
                      </CardTitle>
                      <CardDescription className="text-xs text-white/60">
                        Enter your details to create an account
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Social Login */}
                      <div className="grid grid-cols-1 gap-3">
                        <Clerk.Connection name="google" asChild>
                          <Button
                            variant="outline"
                            type="button"
                            disabled={isGlobalLoading}
                            className="border border-white/20 bg-black text-white font-normal hover:bg-white hover:text-black transition-colors"
                          >
                            <Clerk.Loading scope="provider:google">
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Icons.google className="mr-2 h-4 w-4" />
                                    Continue with Google
                                  </>
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </Clerk.Connection>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                          <span className="bg-black px-3 text-white/60 uppercase tracking-[0.2em]">
                            or
                          </span>
                        </div>
                      </div>

                      {/* Email Field */}
                      <Clerk.Field name="emailAddress" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-xs font-normal tracking-wide">
                            Email
                          </Label>
                        </Clerk.Label>
                        <Clerk.Input type="email" required asChild>
                          <Input
                            className="h-10 rounded-lg border border-white/20 bg-black text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/60"
                            placeholder="you@example.com"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="text-xs text-red-500" />
                      </Clerk.Field>

                      {/* Password Field */}
                      <Clerk.Field name="password" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-xs font-normal tracking-wide">
                            Password
                          </Label>
                        </Clerk.Label>
                        <Clerk.Input type="password" required asChild>
                          <Input
                            className="h-10 rounded-lg border border-white/20 bg-black text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/60"
                            placeholder="Create a password"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="text-xs text-red-500" />
                      </Clerk.Field>

                      {/* CAPTCHA (inline) */}
                      <SignUp.Captcha className="flex justify-center" />
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
                      <SignUp.Action submit asChild>
                        <Button
                          disabled={isGlobalLoading}
                          className="w-full h-10 rounded-lg bg-white text-black font-normal text-sm tracking-wide hover:bg-white/90 transition-colors"
                        >
                          <Clerk.Loading>
                            {(isLoading) =>
                              isLoading ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "Create account"
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </SignUp.Action>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-xs text-white/60 hover:text-white hover:bg-transparent font-normal"
                      >
                        <Clerk.Link navigate="sign-in">
                          Already have an account? Sign in
                        </Clerk.Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </SignUp.Step>

                {/* STEP: CONTINUE (name details) */}
                <SignUp.Step name="continue">
                  <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-medium">
                        Complete your profile
                      </CardTitle>
                      <CardDescription className="text-xs text-white/60">
                        Add your name to finish setting up
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <Clerk.Field name="firstName" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-xs font-normal tracking-wide">
                            First name
                          </Label>
                        </Clerk.Label>
                        <Clerk.Input type="text" required asChild>
                          <Input
                            className="h-10 rounded-lg border border-white/20 bg-black text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/60"
                            placeholder="Enter your first name"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="text-xs text-red-500" />
                      </Clerk.Field>

                      <Clerk.Field name="lastName" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label className="text-xs font-normal tracking-wide">
                            Last name
                          </Label>
                        </Clerk.Label>
                        <Clerk.Input type="text" required asChild>
                          <Input
                            className="h-10 rounded-lg border border-white/20 bg-black text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/60"
                            placeholder="Enter your last name"
                          />
                        </Clerk.Input>
                        <Clerk.FieldError className="text-xs text-red-500" />
                      </Clerk.Field>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
                      <SignUp.Action submit asChild>
                        <Button
                          disabled={isGlobalLoading}
                          className="w-full h-10 rounded-lg bg-white text-black font-normal text-sm tracking-wide hover:bg-white/90 transition-colors"
                        >
                          <Clerk.Loading>
                            {(isLoading) =>
                              isLoading ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "Continue"
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </SignUp.Action>
                    </CardFooter>
                  </Card>
                </SignUp.Step>

                {/* STEP: VERIFICATIONS (email code) */}
                <SignUp.Step name="verifications">
                  <SignUp.Strategy name="email_code">
                    <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-medium">
                          Verify your email
                        </CardTitle>
                        {/* if you want identifier text: */}
                        {/* <CardDescription className="text-xs text-white/60">
                          Enter the code sent to <SignUp.Identifier />
                        </CardDescription> */}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Clerk.Field name="code">
                          <Clerk.Label className="sr-only">
                            Email verification code
                          </Clerk.Label>

                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex justify-center">
                              <Clerk.Input
                                type="otp"
                                autoSubmit
                                className="flex justify-center has-[:disabled]:opacity-50"
                                render={({ value, status }) => (
                                  <div
                                    data-status={status}
                                    className="relative flex h-12 w-12 items-center justify-center border border-white/20 bg-black text-white text-lg transition-all first:rounded-l-lg first:border-r-0 last:rounded-r-lg last:border-l-0 data-[status=selected]:border-white/70 data-[status=selected]:z-10 data-[status=cursor]:border-white/70 data-[status=cursor]:z-10 [&:not(:first-child):not(:last-child)]:border-l-0 [&:not(:first-child):not(:last-child)]:border-r-0"
                                  >
                                    {value}
                                    {status === "cursor" && (
                                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="h-6 w-px bg-white animate-pulse" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              />
                            </div>

                            <Clerk.FieldError className="text-xs text-red-500 text-center" />

                            <SignUp.Action
                              asChild
                              resend
                              fallback={({ resendableAfter }) => (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="text-xs text-white/40 font-normal hover:bg-transparent"
                                >
                                  Resend code in {resendableAfter}s
                                </Button>
                              )}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-white/60 hover:text-white hover:bg-transparent font-normal"
                              >
                                Didn&apos;t receive a code? Resend
                              </Button>
                            </SignUp.Action>
                          </div>
                        </Clerk.Field>
                      </CardContent>

                      <CardFooter>
                        <SignUp.Action submit asChild>
                          <Button
                            disabled={isGlobalLoading}
                            className="w-full h-10 rounded-lg bg-white text-black font-normal text-sm tracking-wide hover:bg-white/90 transition-colors"
                          >
                            <Clerk.Loading>
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  "Verify email"
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </SignUp.Action>
                      </CardFooter>
                    </Card>
                  </SignUp.Strategy>
                </SignUp.Step>
              </>
            )}
          </Clerk.Loading>

          {/* Clerk captcha container (dark theme) */}
          <div
            id="clerk-captcha"
            data-cl-theme="dark"
            data-cl-size="flexible"
            className="mt-4 flex justify-center"
          />
        </SignUp.Root>
      </div>
    </div>
  );
}
