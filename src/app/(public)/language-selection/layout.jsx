import RegisterHead from "@/app/component/Register/RegisterHead";

export default function RegisterLayout({ children }) {
  return (
    <div>
        <main>
            <RegisterHead />
            {children}
        </main>
      </div>
  );
}