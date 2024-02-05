"use client";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import React, { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub, BsGoogle } from "react-icons/bs";
import AuthSocialButton from "./AuthSocialButton";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
type variant = "Login" | "Register";
export default function SignUpForm() {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<variant>("Login");
  const [isloading, setIsLoding] = useState(false);
  const toggleVariant = useCallback(() => {
    if (variant === "Login") {
      setVariant("Register");
    } else {
      setVariant("Login");
    }
  }, [variant]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoding(true);
    if (variant === "Login") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then(() => {
          router.push("/users");
        })
        .catch((err: any) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoding(false);
        });
    }
    if (variant === "Register") {
      axios
        .post("api/register", data)
        .then(() =>
          signIn("credentials", {
            ...data,
            redirect: false,
          }))
        .then((callback) => {
          if (callback?.error) {
            console.log('Invalid credentials!');
          }
          if(callback?.ok){
            router.push('/users')
          }
        })
        .catch((err: any) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoding(false);
        });
    }
  };
  const socialAction = (action: string) => {
    setIsLoding(true);
    signIn(action, { redirect: false })
      .then(() => {
        router.push("/users");
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoding(false);
      });
  };
  return (
    <div
      className="
    mt-8
    sm:mx-auto
    sm:w-full
    sm:max-w-md
    "
    >
      <div
        className="
        bg-white
        px-4
        py-8
        shadow
        sm:rounded-lg
        sm:px-10
        "
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "Register" && (
            <Input
              id="name"
              register={register}
              label="Name"
              errors={errors}
              disabled={isloading}
            />
          )}
          <Input
            id="email"
            type="email"
            register={register}
            label="Email address"
            errors={errors}
            disabled={isloading}
          />
          <Input
            id="password"
            type="password"
            register={register}
            label="Password"
            errors={errors}
            disabled={isloading}
          />
          <div>
            <Button disabled={isloading} type="submit" fullWidth>
              {variant === "Login" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
              disabled={isloading}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
              disabled={isloading}
            />
          </div>
        </div>
        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
          "
        >
          <div>
            {variant === "Login"
              ? "New to PokemonWorld?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className=" cursor-pointer text-blue-800">
            {variant === "Login" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
}
