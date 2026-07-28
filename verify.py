from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/Crane-Nerve/")
    page.wait_for_timeout(1000)

    # Click PROCEED
    page.get_by_role("button", name="Proceed").click()
    page.wait_for_timeout(500)

    # Click on the button with the label containing "Level 11: Night Shift"
    page.locator("h3:has-text('NIGHT SHIFT')").click()
    page.wait_for_timeout(500)

    # Now we are in Level 11.
    page.keyboard.press("4")
    page.wait_for_timeout(200)

    # Take screenshot at the key moment showing the alert right after incorrect press
    page.screenshot(path="/home/jules/verification/screenshots/verification2.png")
    page.wait_for_timeout(2000)  # Hold final state for the video

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
