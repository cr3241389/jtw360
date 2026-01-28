"""
Placeholder image generator for parking section
"""
import os
from PIL import Image, ImageDraw, ImageFont

def create_placeholder_image(width, height, text, filename):
    """Create a placeholder image with text"""
    # Create a new image with a background color
    img = Image.new('RGB', (width, height), color=(70, 130, 180))  # Steel blue
    d = ImageDraw.Draw(img)
    
    # Try to use a basic font
    try:
        # Attempt to use a basic font
        font = ImageFont.load_default()
    except:
        font = None
    
    # Get text bounding box to center the text
    if font:
        bbox = d.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    else:
        # Estimate text size without font
        text_width = len(text) * 10
        text_height = 20
    
    # Calculate position to center the text
    x = (width - text_width) / 2
    y = (height - text_height) / 2
    
    # Draw the text
    d.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save the image
    img.save(filename)
    print(f"Created placeholder: {filename}")

def main():
    # Create placeholder images directory if it doesn't exist
    os.makedirs("img_temp", exist_ok=True)
    
    # Define parking-related images to create
    parking_images = [
        ("parking_center.jpg", "服务中心停车场"),
        ("parking_hotel.jpg", "酒店停车场"),
        ("parking_visitor.jpg", "游客中心停车场"),
        ("parking_square.jpg", "商业广场停车场"),
        ("parking_beach.jpg", "海滩停车场"),
        ("parking_resort.jpg", "度假村停车场")
    ]
    
    for filename, text in parking_images:
        filepath = os.path.join("img_temp", filename)
        if not os.path.exists(filepath):
            create_placeholder_image(300, 200, text, filepath)

if __name__ == "__main__":
    try:
        from PIL import Image, ImageDraw, ImageFont
        main()
    except ImportError:
        print("Pillow library not available. Please install with: pip install Pillow")
        print("Skipping placeholder image creation.")