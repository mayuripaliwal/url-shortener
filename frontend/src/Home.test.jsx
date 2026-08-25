import {expect,test} from "vitest";
import { render,screen } from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import App from "./App";

//tests whether the text "Checking login..." appears on the Home Page
//"Checking login..." should show when user is not logged in
test("Auth check page renders",()=>{
    render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    );
    expect(screen.getByText("Checking login...")).toBeInTheDocument();
});

