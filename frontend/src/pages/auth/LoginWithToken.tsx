import { useState } from "react";
import { Box, Button, Flex, TextField } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";
import { toast } from "sonner";

export const Component = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, updateCurrentUser } = useFrappeAuth(); 
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/method/raven.api.login_token.login_via_token`, {
        method: "POST",
        headers: {
          Authorization: `token ${apiKey}:${apiSecret}`,
        },
        credentials: "include", // store frappe session cookie
      });

      if (!res.ok) throw new Error("Invalid API Token");
      const data = await res.json();
      console.log(data)
      if (data.message.message === "Logged In") {
        localStorage.setItem("frappe_api_key", apiKey);
        localStorage.setItem("frappe_api_secret", apiSecret);

        document.cookie.split(';').forEach((c) => console.log('Cookie:', c));
        await updateCurrentUser();
        //window.location.reload();
        //console.log(currentUser)
        toast.success(`Welcome ${data.full_name}`);
        // setTimeout(() => {
        //   window.location.href = "/";
        // }, 500);
        navigate("/");
        // const URL = import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ``
        // window.location.replace(`${URL}`)
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid API credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-96 space-y-4">
        <h2 className="text-xl font-semibold text-center mb-2">Login via API Token</h2>

        <TextField.Root
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API Key"
          required
        />
        <TextField.Root
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="Enter API Secret"
          required
          type="password"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Authenticating..." : "Login"}
        </Button>
      </form>
    </Box>
  );
};

Component.displayName = "TokenLoginPage";
