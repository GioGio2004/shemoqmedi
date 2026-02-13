"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

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

import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light tracking-[0.35em] uppercase">
            shemoqmedi
          </h1>
          <p className="text-xs text-white/60">
            Sign in to continue
          </p>
        </div>

        <SignIn.Root fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl}>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <>
                {/* STEP: START */}
                <SignIn.Step name="start">
                  <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-medium">
                        Welcome
                      </CardTitle>
                      <CardDescription className="text-xs text-white/60">
                        Enter your email to sign in
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
                      <Clerk.Field name="identifier" className="space-y-2">
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
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
                      <SignIn.Action submit asChild>
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
                      </SignIn.Action>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-xs text-white/60 hover:text-white hover:bg-transparent font-normal"
                      >
                        <Clerk.Link navigate="sign-up">
                          Don&apos;t have an account? Sign up
                        </Clerk.Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </SignIn.Step>

                {/* STEP: CHOOSE STRATEGY */}
                <SignIn.Step name="choose-strategy">
                  <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-medium">
                        Choose a method
                      </CardTitle>
                      <CardDescription className="text-xs text-white/60">
                        Select how you&apos;d like to sign in
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <SignIn.SupportedStrategy name="email_code" asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isGlobalLoading}
                          className="w-full justify-start border border-white/20 bg-black text-white font-normal hover:bg-white hover:text-black transition-colors text-sm"
                        >
                          Email code
                        </Button>
                      </SignIn.SupportedStrategy>

                      <SignIn.SupportedStrategy name="password" asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isGlobalLoading}
                          className="w-full justify-start border border-white/20 bg-black text-white font-normal hover:bg-white hover:text-black transition-colors text-sm"
                        >
                          Password
                        </Button>
                      </SignIn.SupportedStrategy>
                    </CardContent>

                    <CardFooter>
                      <SignIn.Action navigate="previous" asChild>
                        <Button
                          variant="ghost"
                          disabled={isGlobalLoading}
                          className="w-full text-xs text-white/60 hover:text-white hover:bg-transparent font-normal"
                        >
                          <Clerk.Loading>
                            {(isLoading) =>
                              isLoading ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "← Back"
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </SignIn.Action>
                    </CardFooter>
                  </Card>
                </SignIn.Step>

                {/* STEP: VERIFICATIONS */}
                <SignIn.Step name="verifications">
                  {/* PASSWORD STRATEGY */}
                  <SignIn.Strategy name="password">
                    <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-medium">
                          Enter password
                        </CardTitle>
                        <CardDescription className="text-xs text-white/60">
                          Welcome back <SignIn.SafeIdentifier />
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Clerk.Field name="password" className="space-y-2">
                          <Clerk.Label asChild>
                            <Label className="text-xs font-normal tracking-wide">
                              Password
                            </Label>
                          </Clerk.Label>
                          <Clerk.Input type="password" asChild>
                            <Input
                              className="h-10 rounded-lg border border-white/20 bg-black text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/60"
                              placeholder="Enter your password"
                            />
                          </Clerk.Input>
                          <Clerk.FieldError className="text-xs text-red-500" />
                        </Clerk.Field>
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-3">
                        <SignIn.Action submit asChild>
                          <Button
                            disabled={isGlobalLoading}
                            className="w-full h-10 rounded-lg bg-white text-black font-normal text-sm tracking-wide hover:bg-white/90 transition-colors"
                          >
                            <Clerk.Loading>
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  "Sign in"
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>

                        <SignIn.Action navigate="choose-strategy" asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-white/60 hover:text-white hover:bg-transparent font-normal"
                          >
                            Use another method
                          </Button>
                        </SignIn.Action>
                      </CardFooter>
                    </Card>
                  </SignIn.Strategy>

                  {/* EMAIL CODE STRATEGY */}
                  <SignIn.Strategy name="email_code">
                    <Card className="border border-white/10 bg-black rounded-2xl shadow-sm">
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-medium">
                          Check your email
                        </CardTitle>
                        <CardDescription className="text-xs text-white/60">
                          Enter the code sent to <SignIn.SafeIdentifier />
                        </CardDescription>
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

                            <SignIn.Action
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
                            </SignIn.Action>
                          </div>
                        </Clerk.Field>
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-3">
                        <SignIn.Action submit asChild>
                          <Button
                            disabled={isGlobalLoading}
                            className="w-full h-10 rounded-lg bg-white text-black font-normal text-sm tracking-wide hover:bg-white/90 transition-colors"
                          >
                            <Clerk.Loading>
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  "Verify"
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>

                        <SignIn.Action navigate="choose-strategy" asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-white/60 hover:text-white hover:bg-transparent font-normal"
                          >
                            Use another method
                          </Button>
                        </SignIn.Action>
                      </CardFooter>
                    </Card>
                  </SignIn.Strategy>
                </SignIn.Step>
              </>
            )}
          </Clerk.Loading>

          {/* Clerk captcha (dark mode) */}
          <div
            id="clerk-captcha"
            data-cl-theme="dark"
            data-cl-size="flexible"
            className="mt-4 flex justify-center"
          />
        </SignIn.Root>
      </div>
    </div>
  );
}
