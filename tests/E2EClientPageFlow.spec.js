import { test, expect } from '@playwright/test';
import { text } from 'stream/consumers';


test ('Client Page', async ({page})=>
{
    await page.goto("https://rahulshettyacademy.com/client");
    const email = page.locator("#userEmail");
    const emailDescription = "testingmail@test.com";
    const password = page.locator("[type='password']");
    const signIn = page.locator("#login");
    const productChoice = "IPHONE 13 PRO";

    await email.fill(emailDescription);
    await password.fill("@Test123");
    await signIn.click();
    await page.waitForLoadState('networkidle');
    
    const products = page.locator(".card-body");//without the b because the button to click will be outside b
    const titles = await page.locator(".card-body b").allTextContents();
    console.log(titles);
    const productsCount = await products.count();
    const cartBtn = page.locator(".btn-custom")
    //const btnCount = await cartBtn.count();
    
    //Add product to cart
    for (let i=0; i<productsCount; i++) 
    {
        if(await products.nth(i).locator("b").textContent() === productChoice) 
        {
            await products.nth(i).locator("text= Add To Cart").click();//using text as a locator
            break;
        }
         
    }
    
    //Check cart product is there
    /*for (let i=0; i<btnCount; i++) 
    {
        if ((await cartBtn.nth(i).textContent()).includes("Cart"))
        {
            await cartBtn.nth(i).click();
            break;
        }
    }
    */
    //easier way below
    await page.locator("[routerlink*='cart']").click();
    await page.locator("div li").first().waitFor();//isVisible not included on default await, needs explicit wait
    const bool = await page.locator("h3:has-text('IPHONE 13 PRO')").isVisible();//using text as locator 2nd way
    expect(bool).toBeTruthy();
    await page.locator("text=Checkout").click();

    //Shipping info
    await page.locator("[placeholder*=Country]").pressSequentially("bra");
    const dropDown = page.locator(".ta-results");
    await dropDown.waitFor();
    const optionsCount = await dropDown.locator("[type='button']").count();

    for(let i=0; i<optionsCount; i++) 
    {
        const text = await dropDown.locator("[type='button']").nth(i).textContent();
        if(text.trim() === "Brazil") 
        {
            await dropDown.locator("[type='button']").nth(i).click();
            break;
        }
        
    }
    
    await expect(page.locator(".user__name [type='text']").nth(0)).toHaveText(emailDescription);

    //Personal info
    const personalInfoTxtBoxes = page.locator(".title");
    const personalInfoTxtBoxesCount = await personalInfoTxtBoxes.count();
    const creditCardNumber = "1111 1111 1111 1111";
    const cvvCode = "123";
    const cvvCodeText = await page.getByText('CVV Code ?').textContent();
    const cardName = "Robert Tester";

    for(let i=0; i<personalInfoTxtBoxesCount; i++) 
    {
        const text = await personalInfoTxtBoxes.nth(i).textContent();
        if(text === "Credit Card Number ") 
        {
            await page.locator("input[type='text']").nth(i).fill(creditCardNumber);
        }
        if(text === cvvCodeText) 
        {
            await page.locator("input[type='text']").nth(i-1).fill(cvvCode);
        }        
        if(text === "Name on Card ") 
        {
           await page.locator("input[type='text']").nth(i-1).fill(cardName);
        } 
   
    }

    await page.locator(".action__submit").click();

    //Order submit validation
    await expect(page.locator(".hero-primary")).toHaveText(" Thankyou for the order. ");
    const orderID = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
    console.log(orderID);
    await page.locator("button[routerlink*= 'myorders']").click();
    await page.locator("tbody").waitFor();//wait for table to be loaded
    const tableRows = page.locator("tbody .ng-star-inserted");

    for (let i=0; i<await tableRows.count(); i++)
    {
        const rowOrderID = await tableRows.nth(i).locator("th").textContent();
        console.log(rowOrderID);
        if (orderID.includes(rowOrderID)) 
        {
            await tableRows.nth(i).locator(".btn-primary").click();
            break;
        }    
        
    }

    const orderSummaryID = await page.locator(".col-text").textContent();
    expect(orderID.includes(orderSummaryID)).toBeTruthy();


});