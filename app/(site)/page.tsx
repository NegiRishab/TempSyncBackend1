import image from "../../public/images/logo.png";
import SignUpForm from "./components/SignUpForm";
export default function Home() {
  return (
    <div
      className="
            flex
            min-h-full
            flex-col
            justify-center
            py-12
            sm:px-6
            lg:px-8
            bg-gray-100"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          src={image.src}
          alt="logo image"
          className="mx-auto w-28"
        />
        <h2
          className="
               
                text-center
                text-2xl
                font-bold
                tracking-tight
                text-grey-900
                "
        >
          Sign in to Pokemon World
        </h2>
      </div>
      <SignUpForm />
    </div>
  );
}
