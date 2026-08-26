import {expect,test} from "vitest";
import { render,screen } from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import App from "./App";

//tests whether the text "Just a moment..." appears on the Home Page
//"Just a moment..." should show when user is not logged in
test("Auth check page renders",()=>{
    render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    );
    expect(screen.getByText("Just a moment...")).toBeInTheDocument();
});

