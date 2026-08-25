import {expect,test} from "vitest";
import { render,screen } from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import App from "./App";

//tests whether the text "Login" appears on the Home Page
//Login should show when user is not logged in
test("Home page renders",()=>{
    render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
});

