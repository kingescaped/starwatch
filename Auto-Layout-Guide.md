# Comprehensive Guide to Figma Auto Layout: From Basics to Advanced Implementation

Before diving into the detailed points, here's a summary of the key insights: Figma's Auto Layout is a powerful feature that transforms static designs into responsive, adaptable layouts. This guide explores ten critical aspects of Auto Layout, covering everything from basic setups and nested structures to advanced techniques like absolute positioning and mixed layout strategies. You'll learn how to build responsive components, customize padding and spacing, and implement real-world UI elements that automatically adjust to content changes.

## Basic Auto Layout Fundamentals

Auto Layout in Figma transforms static designs into dynamic, responsive layouts that automatically adjust to content changes. This fundamental feature serves as the foundation for creating flexible and maintainable user interfaces.

Auto Layout works by applying a set of rules to frames that determine how child elements behave when content changes. These rules control spacing, alignment, direction, and resizing behaviors. When you add Auto Layout to a frame, it becomes a smart container that maintains consistent spacing and alignment between elements, even as content changes or elements are added and removed.

To get started with Auto Layout, select any elements you want to organize together and press **Shift+A** or click the "+" icon next to Auto Layout in the right sidebar. This converts your selection into an Auto Layout frame. Figma intelligently determines whether to create a horizontal or vertical layout based on your existing element arrangement.

Auto Layout frames have two primary directions: horizontal (for row-based layouts) and vertical (for column-based layouts). These settings can be changed in the Auto Layout section of the properties panel. The direction determines how child elements are stacked within the parent frame.

When working with Auto Layout, you'll notice blue indicators displaying the spacing between elements and padding around the container's edges. These visual guides help you understand the layout structure and make precise adjustments. The spacing between elements is controlled by the "gap" property, while padding defines the space between content and the container's edges.

### Implementation Steps:
1. Select elements you want to organize (text, shapes, icons, etc.)
2. Press **Shift+A** or click "+" next to Auto Layout in the right panel
3. Choose direction (horizontal or vertical) from the dropdown
4. Adjust spacing between elements using the gap control
5. Set padding around the container using the padding controls

Auto Layout is particularly useful for creating components like buttons, cards, and navigation elements that need to adapt to content changes. For instance, a button with Auto Layout will automatically expand to fit longer text while maintaining consistent padding on all sides.

## Nested Auto Layout Techniques

Nested Auto Layout is one of the most powerful techniques in Figma, allowing you to create complex, responsive interfaces by combining multiple Auto Layout frames. This approach creates a hierarchical structure of parent and child containers that can adapt independently based on their content.

The fundamental concept of nested Auto Layout involves placing Auto Layout frames within other Auto Layout frames. Typically, this involves creating a parent frame with one direction (vertical or horizontal) and nesting child frames with the opposite direction. For example, a vertical parent container might hold multiple horizontal child containers, creating a structured layout similar to CSS Flexbox.

This nested approach is essential for building complex components like cards, navigation menus, or dashboards that require multiple levels of organization. Each level of nesting can have its own set of Auto Layout properties, including direction, padding, spacing, and alignment rules.

When implementing nested Auto Layout, it's important to understand the parent-child relationship between frames. The parent frame controls the overall structure and spacing between child frames, while each child frame manages its own internal elements. This hierarchy gives you precise control over every aspect of your layout.

### Implementation Steps:
1. Create a parent Auto Layout frame (Shift+A) with desired direction
2. Create or select child elements
3. Apply Auto Layout to children (Shift+A) with complementary direction
4. Adjust spacing and padding for both parent and children
5. Set appropriate resizing behaviors for each level of nesting

A real-world example would be a card component with:
- Vertical parent Auto Layout for the entire card
- Horizontal child Auto Layout for the header (icon and title)
- Vertical child Auto Layout for the content section
- Horizontal child Auto Layout for the action buttons at the bottom

Each level of nesting can have different spacing, padding, and alignment properties, creating a flexible yet consistent component. This technique is particularly valuable for responsive designs that need to adapt to different screen sizes and content changes.

## Padding Customization Strategies

Padding in Figma Auto Layout provides essential "breathing room" between content and container edges, creating visual hierarchy and improving readability. Mastering padding customization allows you to create more refined, polished interfaces with consistent spacing throughout.

Figma provides several methods for controlling padding in Auto Layout frames. You can adjust uniform padding on all sides, set individual padding values for each side (top, right, bottom, left), or apply padding to opposing sides. Each approach offers different levels of control depending on your design requirements.

When you first add Auto Layout to a frame, Figma intelligently calculates initial padding based on the existing spacing between elements and the frame edges. This automatic calculation provides a good starting point, but you'll often want to refine these values to match your design system's spacing guidelines.

Padding is visualized with blue markers that appear when you select an Auto Layout frame. These visual indicators show the distance between the content and the frame edges, making it easier to maintain consistent spacing throughout your design.

### Implementation Techniques:
1. **Uniform Padding**: Click the padding value in the Auto Layout section and type a single number to apply equal padding to all sides.
2. **Individual Side Padding**: Click the dropdown arrow next to the padding value and adjust each side independently.
3. **Opposing Sides**: Hold Option (Alt) while adjusting padding to modify opposing sides simultaneously.
4. **Visual Adjustment**: Hold Option+Shift and drag the corner handles to visually adjust padding.
5. **Keyboard Increment**: Hold Command (Ctrl) and use up/down arrows to increase/decrease padding by 10px increments.

Advanced padding techniques include using padding to create intentional spacing between specific elements in your layout. For instance, adding bottom padding to a section header creates visual separation from the content below. Similarly, increasing left padding for nested list items creates a hierarchical indentation.

Padding can also be used creatively to solve spacing challenges. For example, when you need different spacing between elements in a single Auto Layout frame, you can apply padding to individual child elements to create the illusion of varied gaps without breaking the Auto Layout structure.

## Absolute Positioning Within Layouts

Absolute positioning in Figma Auto Layout (now called "Ignore Auto Layout" in newer Figma versions) allows you to break free from the standard flow constraints of Auto Layout. This powerful feature enables you to place elements at specific coordinates within an Auto Layout frame while still maintaining the responsive behaviors for other elements.

This capability is particularly valuable when you need to create overlapping elements, floating badges, absolute-positioned icons, or other design elements that don't naturally fit into the sequential flow of Auto Layout. For instance, you might want to position a notification badge at the top-right corner of a button or place a decorative element that overlaps multiple sections.

To use absolute positioning, select an element within an Auto Layout frame and look for the "Ignore Auto Layout" option (previously called "Absolute Position") in the right sidebar's Position section. The icon resembles four corners around an inner square. When enabled, this setting removes the element from the Auto Layout flow, allowing you to position it anywhere within the parent frame.

### Implementation Steps:
1. Select the element you want to position absolutely
2. Find the "Ignore Auto Layout" toggle in the Position section (right sidebar)
3. Enable the toggle to free the element from Auto Layout constraints
4. Position the element manually to the desired location
5. Adjust the z-index as needed to control layering

When an element is set to ignore Auto Layout, it becomes unaffected by the parent frame's spacing, direction, and alignment properties. However, it remains contained within the parent frame and will move if the parent frame is repositioned.

Real-world applications include:
- Adding floating action buttons that partially overlap content
- Creating decorative elements that cross section boundaries
- Positioning badges or indicators at specific positions relative to other elements
- Building complex UI components with overlapping layers
- Implementing hover states that extend beyond normal content bounds

This feature is particularly useful when combined with constraints, allowing you to anchor the absolutely positioned element to specific edges of the parent frame. This ensures proper positioning even when the parent frame changes size or shape.

## Responsive Resizing Techniques

Responsive resizing is at the heart of Figma's Auto Layout capabilities, enabling your designs to adapt fluidly to different screen sizes, content changes, and container dimensions. Mastering these techniques allows you to create truly responsive interfaces that work consistently across devices.

The core of responsive resizing in Auto Layout revolves around two key properties: how the frame itself resizes (parent behavior) and how elements within the frame resize (child behavior). These properties can be set independently for both width and height, giving you precise control over how your layouts respond to changes.

For frames with Auto Layout, you have several resizing options:
- **Fixed**: Maintains exact dimensions regardless of content
- **Hug Content**: Shrinks or grows to fit the content exactly
- **Fill Container**: Expands to fill available space in the parent frame

Additionally, you can set minimum and maximum dimension constraints to prevent layouts from becoming too small or too large in different scenarios. These constraints are particularly useful for ensuring readability and maintaining visual hierarchy across different viewport sizes.

### Implementation Steps:
1. Select an Auto Layout frame or element
2. In the right sidebar, find the Width and Height dropdowns
3. Choose the appropriate resizing behavior (Fixed, Hug Content, Fill)
4. Click the dropdown again to add min/max constraints if needed
5. Enter specific values for min/max dimensions

When working with nested Auto Layout frames, you can create sophisticated responsive behaviors by combining different resizing rules at each level. For example, a card component might have:
- Parent frame: Hug content vertically, fixed width horizontally
- Image container: Fixed height, fill container width
- Text container: Hug content vertically, fill container width
- Button container: Hug content in both directions

These combinations allow you to create designs that respond intelligently to content changes. For instance, text can wrap and expand vertically while maintaining a fixed width, images can scale proportionally within constraints, and buttons can adjust to accommodate different label lengths.

To test responsive behaviors, use Figma's resize handles to simulate different viewport sizes or text content changes. This helps identify potential layout issues before implementation and ensures your designs work across different scenarios.

## Spacing and Alignment Controls

Effective spacing and alignment are fundamental to creating visually balanced, easy-to-scan interfaces. Figma's Auto Layout provides powerful controls for managing the spatial relationships between elements, allowing you to create consistent and harmonious designs.

The primary spacing control in Auto Layout is the "gap" property, which defines the space between child elements. This can be set uniformly for all gaps or customized for specific elements. Gap controls appear as magenta highlights when you hover over an Auto Layout frame, providing visual feedback as you adjust spacing.

Alignment controls determine how elements are positioned within the available space. Figma offers several alignment options:
- **Left/Top**: Aligns elements to the start of the container
- **Center**: Centers elements within the container
- **Right/Bottom**: Aligns elements to the end of the container
- **Space Between**: Distributes elements evenly with equal space between them
- **Space Around**: Similar to space between, but with half-size spaces at the edges
- **Packed**: Clusters elements together with the specified gap

These alignment options work in conjunction with the Auto Layout direction (horizontal or vertical) and can dramatically change how your interface elements are arranged and distributed.

### Implementation Techniques:
1. Select an Auto Layout frame
2. Adjust the gap value in the Auto Layout section to control spacing between elements
3. Click the alignment icons to change how elements are distributed
4. For advanced distribution, click the alignment icon multiple times to cycle through options
5. Use space-between for navigation bars or justifying content to opposite ends

For more granular control, you can:
- Click and drag the gap indicators (magenta lines) directly on the canvas
- Hold Shift while dragging to make larger adjustments
- Use keyboard shortcuts (arrow keys) to nudge alignment settings
- Apply different alignment settings to nested frames to create complex layouts

A powerful technique is using "space between" alignment for elements like navigation bars or action buttons, where you want items at opposite ends of a container. This creates a balanced layout that adapts to different widths without requiring absolute positioning.

For elements that need custom spacing not easily achieved with uniform gaps, you can add invisible spacer elements or utilize padding on individual elements to create the appearance of varied spacing while maintaining the benefits of Auto Layout.

## Component Adaptability

Component adaptability is the ability of Figma components to dynamically respond to content changes, screen size variations, and different use cases without requiring manual adjustments. Auto Layout plays a crucial role in creating highly adaptable components that maintain their integrity across different contexts.

When building adaptable components, it's essential to combine Auto Layout with Figma's component variants and properties. This powerful combination allows you to create components that can change their appearance and behavior based on specific conditions while maintaining a consistent design language.

The key to building adaptable components is planning for flexibility from the start. This involves:
- Using Auto Layout for dynamic resizing and spacing
- Structuring components with nested frames for complex behaviors
- Setting appropriate resizing properties for different elements
- Establishing variants for different states and contexts
- Creating component properties that can be modified in instances

Figma's boolean properties are particularly useful for creating adaptable components. These true/false toggles can control the visibility of elements like icons, badges, or additional content sections. For example, a button component might have a boolean property that shows or hides an icon.

### Implementation Steps:
1. Create a base component with Auto Layout
2. Set appropriate resizing behaviors for all elements
3. Add variants for different states or appearances 
4. Create component properties for customizable aspects
5. Use boolean properties for optional elements
6. Use instance swap properties for interchangeable elements
7. Test the component across different contexts and sizes

An advanced technique is creating responsive components that adapt to different screen sizes without requiring separate variants for each breakpoint. This can be achieved by:
- Using fill container for elements that should expand
- Setting appropriate min/max constraints to prevent extreme sizes
- Nesting Auto Layout frames with different stacking directions
- Using properties to control layout changes at different sizes

For example, a card component might stack content vertically on mobile but arrange it horizontally on larger screens. This can be controlled with a property that changes the primary Auto Layout direction and adjusts spacing and padding accordingly.

Adaptable components save significant design and development time by reducing the need for multiple versions of the same component. They also ensure consistency across your product by maintaining the same underlying structure despite visual variations.

## Mixed Layout Strategies

Mixed layout strategies involve combining different layout approaches to create more sophisticated and flexible design systems. This technique allows you to leverage the strengths of various Figma features, including Auto Layout, constraints, and layout grids, to build interfaces that respond intelligently to different content and viewport conditions.

The core of mixed layout strategies is understanding when to use each approach:
- **Auto Layout**: Ideal for components that need to adapt to content changes
- **Layout Grids**: Perfect for creating consistent alignment and spacing
- **Constraints**: Essential for controlling how elements resize with their parent frames
- **Fixed Positioning**: Useful for elements that need to maintain specific positions

When these approaches are combined thoughtfully, you can create layouts that have both the flexibility of Auto Layout and the precision of fixed positioning or grid systems.

A common mixed layout strategy is nesting Auto Layout frames with different directions. For example, a page layout might use:
- Vertical Auto Layout for the overall page structure
- Horizontal Auto Layout for the header navigation
- Grid-based layout for a gallery section
- Mixed vertical and horizontal frames for content sections

### Implementation Techniques:
1. Start with the primary layout structure using Auto Layout
2. Add Layout Grids to frames that benefit from grid alignment
3. Use constraints to control how elements resize within non-Auto Layout frames
4. Combine horizontal and vertical Auto Layout frames for complex structures
5. Use absolute positioning selectively for elements that need to break the flow

For responsive dashboards or multi-column layouts, you might:
- Create a main container with horizontal Auto Layout
- Set sidebar frames to fixed width and main content to fill container
- Use vertical Auto Layout within each section
- Apply layout grids to content areas that need grid alignment
- Set appropriate constraints for elements that aren't in Auto Layout frames

Layout grids work particularly well with Auto Layout when you need precise alignment across different sections. The grid provides visual guidance, while Auto Layout handles the dynamic spacing and resizing.

Another powerful technique is using "stretch" vs. "fixed" layout grids in combination with Auto Layout. Stretch grids adapt to the parent frame size, while fixed grids maintain consistent column widths. This gives you fine-grained control over how different sections of your interface respond to viewport changes.

## Usability Improvements and Shortcuts

Figma continually enhances Auto Layout with usability improvements and time-saving shortcuts that speed up your workflow and reduce repetitive tasks. Mastering these efficiency boosters can significantly increase your productivity when working with Auto Layout.

The most essential shortcuts and techniques include:

### Keyboard Shortcuts:
- **Shift+A**: Add Auto Layout to selected elements
- **Alt/Option + Arrow keys**: Change alignment settings
- **Cmd/Ctrl + Arrow keys**: Make 10px adjustments to padding/spacing
- **Cmd/Ctrl + Shift + Arrow keys**: Resize Auto Layout frames by 10px increments
- **Alt/Option + Shift + drag**: Adjust padding visually from corners

### Time-Saving Techniques:
1. **Quick Add**: Drag and drop elements directly into Auto Layout frames to automatically incorporate them into the layout
2. **Direction Toggle**: Double-click the direction icon to quickly switch between horizontal and vertical layouts
3. **Suggest Auto Layout**: Use Ctrl/Cmd+Shift+A to have Figma suggest an Auto Layout configuration based on your selected elements
4. **Independent Padding**: Click the chain icon to unlink padding values and set them independently
5. **Gap Adjustments**: Click and drag directly on the magenta gap indicators to visually adjust spacing

### Advanced Efficiency Features:
- **Copy-Paste Auto Layout Settings**: Right-click an Auto Layout frame and select "Copy Properties" > "Auto Layout" to apply the same settings to other frames
- **Batch Editing**: Select multiple Auto Layout frames to edit their properties simultaneously
- **Smart Selection**: Double-click to select nested frames or elements within complex Auto Layout structures
- **Reset to Defaults**: Right-click on Auto Layout controls to reset to default values
- **Bulk Conversion**: Select multiple groups or frames and apply Auto Layout to all of them at once

Figma's more recent usability improvements include:
- Gap overrides that allow for different spacing between specific elements
- Enhanced wrapping behaviors for creating responsive grid-like layouts
- Smarter default padding calculations based on element spacing
- Improved visual feedback for padding and spacing adjustments
- Better handling of text resizing within Auto Layout frames

These shortcuts and improvements make it faster and easier to work with Auto Layout, especially when creating complex interfaces with multiple nested frames and components. By incorporating these techniques into your workflow, you can maintain design consistency while significantly reducing the time spent on manual adjustments and repetitive tasks.

## Real-World Component Creation

Building real-world components with Auto Layout demonstrates how the theoretical principles translate into practical UI elements that designers create every day. These examples showcase how Auto Layout can be used to build flexible, responsive, and maintainable components for production-ready designs.

### Card Component
Cards are perfect candidates for Auto Layout because they need to adapt to different content lengths and maintain consistent spacing.

**Implementation Steps:**
1. Create a vertical Auto Layout frame for the main card container
2. Set appropriate padding (e.g., 16px on all sides)
3. Add an image container with fill width and fixed height
4. Add a text container with vertical Auto Layout for heading and description
5. Add a horizontal Auto Layout frame for action buttons
6. Apply "fill container" width to elements that should expand
7. Set appropriate spacing between sections (e.g., 12px)
8. Create variants for different card states (default, hover, selected)
9. Add component properties for customizable elements

This structure allows the card to adapt to different content lengths while maintaining consistent spacing and alignment. The heading might be set to "hug content" vertically while the description could wrap and expand as needed.

### Navigation Menu
Navigation menus benefit from Auto Layout's ability to handle dynamic content and different screen sizes.

**Implementation Steps:**
1. Create a horizontal Auto Layout frame for the main navigation
2. Add a logo component at the start
3. Create a horizontal Auto Layout frame for menu items
4. Set the menu container to "fill container" to use available space
5. Use "space between" alignment to push items to opposite ends
6. Create consistent padding and spacing for menu items
7. Add a vertical Auto Layout frame for dropdown menus
8. Use nested Auto Layout for responsive behavior on smaller screens
9. Add component properties to control menu appearance

This approach creates a flexible navigation that can accommodate different numbers of menu items and adapt to various screen sizes. On smaller screens, you might change the primary direction from horizontal to vertical and adjust spacing accordingly.

### Form Elements
Form components like input fields and selection controls demonstrate the power of Auto Layout for interactive elements.

**Implementation Steps:**
1. Create a vertical Auto Layout frame for the form field container
2. Add a label with appropriate spacing
3. Create a horizontal Auto Layout frame for the input field
4. Add leading and trailing icons with "hug content" sizing
5. Set the input text element to "fill container"
6. Add a helper text or error message container below
7. Create component properties for states (default, focus, error, disabled)
8. Add boolean properties to show/hide optional elements
9. Set appropriate constraints and resizing behaviors

This structure creates form fields that adapt to different content lengths and container widths while maintaining consistent alignment and spacing. The boolean properties allow designers to easily toggle elements like icons or helper text based on the specific context.

By understanding how to build these common components with Auto Layout, designers can create more consistent, adaptable interfaces that work across different screen sizes and content scenarios. These real-world examples demonstrate the practical benefits of Auto Layout for everyday design tasks and provide templates that can be adapted for a wide range of use cases.

Sources
[1] a54c https://gist.githubusercontent.com/eonist/a54c
[2] AI design prompt templates - GitHub Gist https://gist.github.com/eonist/166bf55c1c61b99d5712e826c6df0d15
[3] Explore auto layout properties – Figma Learn - Help Center https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties
[4] Auto Layout Explained in 10 Minutes /// Figma Tutorial - YouTube https://www.youtube.com/watch?v=QDjPXRWOLbI
[5] Design Smarter with Figma Auto Layout - Builder.io https://www.builder.io/blog/figma-auto-layout
[6] Mastering Advanced Auto Layout in Figma: Combining Complex ... https://thecodeaccelerator.com/blog/mastering-advanced-auto-layout-in-figma-combining-complex-structures-with-constraints
[7] Auto Layout Hacks: Use Different Gaps Between Items - YouTube https://www.youtube.com/watch?v=Hw0jaQDOUeg
[8] How to add Padding to your designs | Figma Tip - YouTube https://www.youtube.com/watch?v=pN2L44ydMM0
[9] Where is absolute position? - Figma Forum https://forum.figma.com/ask-the-community-7/where-is-absolute-position-26954
[10] How to use absolute position in #Figma - YouTube https://www.youtube.com/watch?v=CyeIy0Cshec
[11] Create Responsive Designs in Figma - Anima Help Center https://support.animaapp.com/en/articles/6431384-create-responsive-designs-in-figma
[12] How to set the minimum and maximum width or height of a frame in ... https://www.delasign.com/blog/figma-frame-min-max/
[13] Set space between with Figma auto layout - YouTube https://www.youtube.com/watch?v=KeHgBiv7FhI
[14] Figma Tutorial: Alignment & Distribution - YouTube https://www.youtube.com/watch?v=qQyaPqem0TA
[15] Figma: Building Responsive Components in Two Steps - YouTube https://www.youtube.com/watch?v=qW3J4EVMeZI
[16] Components, Properties & Variants best practices : r/FigmaDesign https://www.reddit.com/r/FigmaDesign/comments/1bilwcz/components_properties_variants_best_practices/
[17] Combine Layout Grids and Constraints – Figma Learn - Help Center https://help.figma.com/hc/en-us/articles/360039957934-Combine-Layout-Grids-and-Constraints
[18] Mastering Figma Auto Layout: Everything you need to know | Instant https://instant.so/blog/figma-auto-layout-guide
[19] Figma / 10 Auto Layout Tricks Every Designer Should Know - YouTube https://www.youtube.com/watch?v=jwTU9MDeCh0
[20] Build a Professional Card Component in Figma from SCRATCH! https://www.youtube.com/watch?v=dPqQFZ6Ix2A
[21] Figma tutorial: Auto layout navigation menu - YouTube https://www.youtube.com/watch?v=bh98SF7OjUk
[22] PavelLaptev/Figma-Auto-Layout-Styles - GitHub https://github.com/PavelLaptev/Figma-Auto-Layout-Styles
[23] Tackling Figma Auto Layout: A 6-Step Guide | Blush Blog https://blush.design/blog/post/figma-auto-layout
[24] Add auto layout to a design – Figma Learn - Help Center https://help.figma.com/hc/en-us/articles/5731482952599-Add-auto-layout-to-a-design
[25] How to Use Auto Layout Figma - Layerpath https://www.layerpath.com/learn/how-to-use-auto-layout-figma
[26] Figma tutorial: Card component with auto layout - YouTube https://www.youtube.com/watch?v=WuKnJFxrxNg
[27] How to Create Responsive Forms in Figma with Auto Layout https://www.frae.au/blog/how-to-create-responsive-forms-in-figma-with-autolayout
[28] A Guide to Auto Layout: Best Practices, Tips & Tricks | Figma https://www.youtube.com/watch?v=1odqpkfkDL8
[29] AutoLayouts - Figma https://www.figma.com/community/plugin/1222614762966853894/autolayouts
[30] Figma in 5: Auto Layout - YouTube https://www.youtube.com/watch?v=TyaGpGDFczw
[31] Define default padding for Auto Layout (or set to 0) - Figma Forum https://forum.figma.com/suggest-a-feature-11/define-default-padding-for-auto-layout-or-set-to-0-3053
[32] Figma Tip: Auto layout wrap - YouTube https://www.youtube.com/watch?v=c3S5MR_LEYM
[33] Learn Figma Auto Layout in 10 Minutes (Everything You ... - YouTube https://www.youtube.com/watch?v=To_ADCVSg5g
[34] Auto layout Examples - Figma https://www.figma.com/community/file/1031281454321578620/auto-layout-examples
[35] Figma Tutorial: Auto Layout | Master Auto Layout in 15 Minutes https://www.youtube.com/watch?v=42uQGucQA9o
[36] Figma for Education: Learning Auto layout - YouTube https://www.youtube.com/watch?v=PGYCZbP3xH4
[37] Horizontal and Vertical Scroll in Figma | Figma Tutorial - YouTube https://www.youtube.com/watch?v=EobSNkzdN7A
[38] Auto Layout in Figma - Figma Handbook - Design+Code https://designcode.io/figma-handbook-auto-layout/
[39] Horizontal & Vertical Scrolling | Figma Tutorial - YouTube https://www.youtube.com/watch?v=wIPo7vxxchY
[40] Quick tips for Auto Layout in Figma | by James Peacock | UX Collective https://uxdesign.cc/quick-tips-for-auto-layout-in-figma-411c639a51b0
[41] Auto Layout in Figma: A Step-by-Step Guide for Designers - Skillshare https://www.skillshare.com/en/blog/auto-layout-figma/
[42] Horizontal and Vertical Scroll in Figma - Quick Prototyping Tutorial https://www.youtube.com/watch?v=6lSvKk7lTl0
[43] Figma Auto Layout + Interactive Components | Design a Todo List https://www.youtube.com/watch?v=7qHen_tZPlU
[44] Auto Layout in Figma - Design good practices https://goodpractices.design/tutorials/figma-auto-layout
[45] Ultimate Guide to Mastering Auto Layout in Figma - UI Prep https://www.uiprep.com/blog/ultimate-guide-to-mastering-auto-layout-in-figma
[46] How to create Horizontal and Vertical Scroll in Figma - YouTube https://www.youtube.com/watch?v=MIR4OWxvmJk
[47] Figma Auto Layout | Every Single Setting EXPLAINED ! - YouTube https://www.youtube.com/watch?v=C6g2t5mmsq4
[48] auto layout & components - Figma tutorial for beginners - YouTube https://www.youtube.com/watch?v=HwiHqfax7Uk
[49] Figma AUTO LAYOUT — IN-DEPTH GUIDE (Explanation, Nested ... https://www.youtube.com/watch?v=J6iAXQlgc2M
[50] Create a nested responsive component in Figma using autolayout ... https://www.youtube.com/watch?v=I6a0GtIdZmU
[51] Nesting Multiple Auto Layouts inside each other in Figma https://www.creativelive.com/class/figma-advanced-become-a-figma-pro-daniel-walter-scott/lessons/nesting-multiple-auto-layouts-inside-each-other-in-figma
[52] Enable auto layout on multiple frames at once? - Figma Forum https://forum.figma.com/t/enable-auto-layout-on-multiple-frames-at-once/3070
[53] Make child frames 100% width of parent when layout is vertical https://forum.figma.com/ask-the-community-7/make-child-frames-100-width-of-parent-when-layout-is-vertical-23400
[54] Exploring nested auto layout - Figma Video Tutorial - LinkedIn https://www.linkedin.com/learning/figma-using-auto-layout/exploring-nested-auto-layout
[55] How to create auto layout in both direction - Figma Forum https://forum.figma.com/archive-21/how-to-create-auto-layout-in-both-direction-30691
[56] Is there a way to set the auto-layout of a child frame node within a ... https://forum.figma.com/archive-21/is-there-a-way-to-set-the-auto-layout-of-a-child-frame-node-within-a-frame-node-to-horizontal-so-it-s-children-are-lined-up-in-a-row-as-opposed-to-a-column-but-have-the-child-frame-node-fill-the-container-as-well-15132
[57] How do I make this component responsive in auto layout? https://forum.figma.com/ask-the-community-7/how-do-i-make-this-component-responsive-in-auto-layout-21133
[58] Auto Layout Nested Design for Icons and Text - Figma Forum https://forum.figma.com/ask-the-community-7/auto-layout-nested-design-for-icons-and-text-28713
[59] Create multiple frames with auto layout - Figma Forum https://forum.figma.com/archive-21/create-multiple-frames-with-auto-layout-11121
[60] Set child-elements to stack from horizontally to vertically when you ... https://forum.figma.com/suggest-a-feature-11/set-child-elements-to-stack-from-horizontally-to-vertically-when-you-change-the-width-of-the-parent-27905
[61] I feel comfortable using auto layout to create complex components ... https://www.reddit.com/r/FigmaDesign/comments/xn1bd9/i_feel_comfortable_using_auto_layout_to_create/
[62] Help with merging frames in auto layout (reposted) : r/FigmaDesign https://www.reddit.com/r/FigmaDesign/comments/10kwxor/help_with_merging_frames_in_auto_layout_reposted/
[63] How to Use Constraints in Figma - imagy.app https://imagy.app/constraints-in-figma/
[64] Building a Responsive Layout Using Figma's Auto Layout Feature https://www.nobledesktop.com/learn/figma/building-a-responsive-layout-using-figmas-auto-layout-feature
[65] Edit the space between items (paddings) in auto layout independently https://forum.figma.com/suggest-a-feature-11/edit-the-space-between-items-paddings-in-auto-layout-independently-26588
[66] How to change spacing between single elements in Auto Layout https://forum.figma.com/archive-21/how-to-change-spacing-between-single-elements-in-auto-layout-9096
[67] Blue line pops us when selecting something : r/FigmaDesign - Reddit https://www.reddit.com/r/FigmaDesign/comments/1fzq73s/blue_line_pops_us_when_selecting_something/
[68] Mixed padding on Autolayout - Figma Community Forum https://forum.figma.com/t/mixed-padding-on-autolayout/18228
[69] Set default values for Section padding (left, right, top ... - Figma Forum https://forum.figma.com/suggest-a-feature-11/set-default-values-for-section-padding-left-right-top-bottom-instead-of-a-fixed-80px-7967
[70] Padding/ margins and spacing in Figma best practices : r/FigmaDesign https://www.reddit.com/r/FigmaDesign/comments/19893zf/padding_margins_and_spacing_in_figma_best/
[71] Red lines and Blue gaps - Figma Forum https://forum.figma.com/archive-21/red-lines-and-blue-gaps-24133
[72] Can I override padding in an auto layout? I want the lighter grey ... https://www.reddit.com/r/FigmaDesign/comments/144nx95/can_i_override_padding_in_an_auto_layout_i_want/
[73] Using Number Variables for Padding + Gap in Figma - YouTube https://www.youtube.com/watch?v=ZZU7MTIaZto
[74] 10 Auto Layout Tricks in Figma Every Designer Should Know https://uxdesign.cc/10-auto-layout-tricks-in-figma-every-designer-should-know-158cf1f87ef
[75] Autolayout Padding Grid Color - Figma Forum https://forum.figma.com/archive-21/autolayout-padding-grid-color-24343
[76] How to Add Padding in Figma: 1-Min Guide - Storylane https://www.storylane.io/tutorials/how-to-add-padding-in-figma
[77] Variables distinguish between auto layout gap and padding https://forum.figma.com/suggest-a-feature-11/variables-distinguish-between-auto-layout-gap-and-padding-29182
[78] Add "Style" feature for Padding, corner and spacing (just like font ... https://forum.figma.com/archive-21/add-style-feature-for-padding-corner-and-spacing-just-like-font-effects-colors-23154
[79] Auto layout makes contents absolutely positioned - Figma Forum https://forum.figma.com/ask-the-community-7/auto-layout-makes-contents-absolutely-positioned-32364
[80] How to use absolute positioning in Figma like a pro ... - YouTube https://www.youtube.com/watch?v=GSrrx0Goeqo
[81] Molly Hellmuth's Post - Figma Tip - LinkedIn https://www.linkedin.com/posts/molly-hellmuth-9155725a_figma-tip-tell-some-layers-ignore-auto-layout-activity-7270446076438933504-wydH
[82] How to Create a Fixed Position When Scrolling in Figma - imagy.app https://imagy.app/how-to-create-a-fixed-position-in-figma/
[83] Remove automatic absolute positioning in autolayout - Figma Forum https://forum.figma.com/suggest-a-feature-11/remove-automatic-absolute-positioning-in-autolayout-28077
[84] Switching the auto layout direction broke my original settings https://forum.figma.com/report-a-problem-6/switching-the-auto-layout-direction-broke-my-original-settings-34209
[85] "Ignore Padding" option for Autolayout objects - Figma Forum https://forum.figma.com/archive-21/ignore-padding-option-for-autolayout-objects-34660
[86] Figma tutorial for beginners: Fixed positioned elements - YouTube https://www.youtube.com/watch?v=R7FcMWo05Gc
[87] Launched: Absolute position in Auto Layout - Figma Forum https://forum.figma.com/archive-21/launched-absolute-position-in-auto-layout-24962
[88] Turn on 'ignore auto layout' with a shortcut - Figma Forum https://forum.figma.com/archive-21/turn-on-ignore-auto-layout-with-a-shortcut-30013
[89] Create a fixed/sticky header inside an autolayout in Figma - YouTube https://www.youtube.com/watch?v=_hsQTBRTO_s
[90] PROTOTYPING absolute position and auto layout - Figma Forum https://forum.figma.com/ask-the-community-7/prototyping-absolute-position-and-auto-layout-36188
[91] Override auto layout direction on the instances - Figma Forum https://forum.figma.com/suggest-a-feature-11/override-auto-layout-direction-on-the-instances-24618
[92] IGNORE AUTO LAYOUT doesn't work when i use it in a component https://forum.figma.com/report-a-problem-6/ignore-auto-layout-doesn-t-work-when-i-use-it-in-a-component-37522
[93] No fixed position option when using auto layout? - Figma Forum https://forum.figma.com/ask-the-community-7/no-fixed-position-option-when-using-auto-layout-33136
[94] Random autolayout properties change when editing content in ... https://forum.figma.com/archive-21/random-autolayout-properties-change-when-editing-content-in-instances-28515
[95] Resizing Issue Auto Layout : r/FigmaDesign - Reddit https://www.reddit.com/r/FigmaDesign/comments/17hgirq/resizing_issue_auto_layout/
[96] MASTER Figma Auto Layout Constraints & Resizing | Tutorial https://www.youtube.com/watch?v=fGxrLoxa30A
[97] The Fixed Resizing Property of Auto Layout in Figma is not working ... https://www.reddit.com/r/FigmaDesign/comments/1eyecz3/the_fixed_resizing_property_of_auto_layout_in/
[98] Updates to Hug and Fill? : r/FigmaDesign - Reddit https://www.reddit.com/r/FigmaDesign/comments/1exrt0u/updates_to_hug_and_fill/
[99] Components won't resize if they're in an auto layout frame https://forum.figma.com/report-a-problem-6/components-won-t-resize-if-they-re-in-an-auto-layout-frame-8071
[100] Auto layout, Responsively, Fixed aspect ratio (2024) - YouTube https://www.youtube.com/watch?v=MhHgib03b8s
[101] Min and Max Width/Height in CSS - Ahmad Shadeed https://ishadeed.com/article/min-max-css/
[102] Figma Auto Layout Hug, Fixed and Fill #figmatutorial ... - YouTube https://www.youtube.com/watch?v=XyEThS8Yc14
[103] Defaults for Auto Layout Resizing - Figma Forum https://forum.figma.com/ask-the-community-7/defaults-for-auto-layout-resizing-8780
[104] How to create responsive design in Figma : r/FigmaDesign - Reddit https://www.reddit.com/r/FigmaDesign/comments/uwpcel/how_to_create_responsive_design_in_figma/
[105] Min/Max Width and Height - Yoga https://www.yogalayout.dev/docs/styling/min-max-width-height
[106] Watch This to Finally Understand FILL CONTAINER ... - YouTube https://www.youtube.com/watch?v=0MwQ_se-t1o
[107] Using constraints & magic numbers to build responsive layouts in ... https://www.figma.com/blog/creating-responsive-layout-templates-in-figma/
[108] Constraints and modifier order | Jetpack Compose https://developer.android.com/develop/ui/compose/layouts/constraints-modifiers
[109] New Auto Layout, Hug content and Fill container | Figma Forum https://forum.figma.com/ask-the-community-7/new-auto-layout-hug-content-and-fill-container-10200
[110] Auto layout ( Space Between) - Figma Forum https://forum.figma.com/archive-21/auto-layout-space-between-7054
[111] Where is Auto Layout Space Between? - Figma Forum https://forum.figma.com/ask-the-community-7/where-is-auto-layout-space-between-36956
[112] How to use space between in a Figma auto layout - delasign https://www.delasign.com/blog/figma-auto-layout-space-between/
[113] Restore spacing mode option on auto layouts - Figma Forum https://forum.figma.com/archive-21/restore-spacing-mode-option-on-auto-layouts-21971
[114] Maintaining irregular spacing while using auto-layout : r/FigmaDesign https://www.reddit.com/r/FigmaDesign/comments/xfxb4a/maintaining_irregular_spacing_while_using/
[115] Adjust alignment, rotation, position, and dimensions - Figma help https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-rotation-position-and-dimensions
[116] Aligning Objects — Figma for Developers | Steve Kinney https://stevekinney.net/courses/figma/aligning-objects
[117] Master Auto Layout in Figma with This Tutorial - Uxcel https://app.uxcel.com/tutorials/master-auto-layout-in-figma-with-this-tutorial-158
[118] Alignment, Distribution, & Tidy up Properties - Figma Handbook https://designcode.io/figma-handbook-alignment-properties/
[119] 2.11 Alignment & Distribution in Figma - YouTube https://www.youtube.com/watch?v=JQmC6fGp6LA
[120] Is there a way to set different spacing in Auto layout? - Figma Forum https://forum.figma.com/ask-the-community-7/is-there-a-way-to-set-different-spacing-in-auto-layout-13872
[121] Auto Layout: Align 2 objects Center and Left/Right - Figma Forum https://forum.figma.com/ask-the-community-7/auto-layout-align-2-objects-center-and-left-right-13676
[122] Figma for Edu: Auto layout components - YouTube https://www.youtube.com/watch?v=wukJ1MTRxgQ
[123] Autolayout now works with Interactive Components - YouTube https://www.youtube.com/watch?v=Q4ocCok_1M8
[124] Design Better Responsive Components in Figma - UI Cards - YouTube https://www.youtube.com/watch?v=m6cFikPEL_c
[125] Components, styles, and shared library best practices - Figma https://www.figma.com/best-practices/components-styles-and-shared-libraries/
[126] Building Complex Figma Variants https://build.diligent.com/building-complex-figma-variants-e1005832c531
[127] Interactive Button Components with Icons using Auto Layout in Figma https://www.youtube.com/watch?v=7_jd1-UvJpk
[128] How to Make Complex Figma Components with Auto Layout https://www.figma.com/community/file/806330013368094710/how-to-make-complex-figma-components-with-auto-layout
[129] Figma's Updated Auto-Layout - Tutorial with Responsive Components https://www.youtube.com/watch?v=3-Vv3HLX2OU
[130] Ultimate Guide to Figma Components & Variants - YouTube https://www.youtube.com/watch?v=6XST-BB2JpI
[131] LAUNCHED: Support Auto Layout in Interactive Components https://forum.figma.com/archive-21/launched-support-auto-layout-in-interactive-components-9105
[132] Create layout grids with grids, columns, and rows - Figma help https://help.figma.com/hc/en-us/articles/360040450513-Create-layout-grids-with-grids-columns-and-rows
[133] Figma for Edu: Variables and modes for layout in Figma - YouTube https://www.youtube.com/watch?v=0ioM6arfU-k
[134] Responsive layout grid in Figma - YouTube https://www.youtube.com/watch?v=msymY5ujRUo
[135] 6 Basic Figma Techniques Every Designer Should Master - Floowi https://floowitalent.com/6-basic-figma-techniques-every-designer-should-master/
[136] Branching in Figma https://www.figma.com/best-practices/branching-in-figma/
[137] Auto layout grid/table | Figma Forum https://forum.figma.com/archive-21/auto-layout-grid-table-4341
[138] How work is changing at Figma | Figma Blog https://www.figma.com/blog/how-work-is-changing-at-figma/
[139] Layout grid and auto layout together? - Figma Forum https://forum.figma.com/archive-21/layout-grid-and-auto-layout-together-27735
[140] 5 strategies to convert Figma designs into functional apps in 2025 https://momen.app/blogs/build-your-own-app-from-figma-designs-2025/
[141] You can use Auto Layout in a component with multiple variants to ... https://www.reddit.com/r/FigmaDesign/comments/nx3i3q/my_favorite_trick_you_can_use_auto_layout_in_a/
[142] Masonry Grid with Auto layout - Figma Crash Course - YouTube https://www.youtube.com/watch?v=mn4UvM0Q9GA
[143] Behind the feature: the making of the new Auto Layout | Figma Blog https://www.figma.com/blog/behind-the-feature-the-making-of-the-new-auto-layout/
[144] Auto Layout Tips & Hacks - Figma https://www.figma.com/community/file/807568435328340012/auto-layout-tips-hacks
[145] Tip for understanding Auto-layout : r/FigmaDesign - Reddit https://www.reddit.com/r/FigmaDesign/comments/1j38mzv/tip_for_understanding_autolayout/
[146] Figma's Auto Layout: The Ultimate Guide to Responsive Design - TDP https://designproject.io/blog/figma-auto-layout-guide/
[147] Shortcut "control" + "A" (Add auto layout) doesn't work - Figma Forum https://forum.figma.com/archive-21/shortcut-control-a-add-auto-layout-doesn-t-work-14134
[148] Mastering Auto Layouts in Figma: Advanced Tips and Tricks for ... https://www.youtube.com/watch?v=c_xy29h7apQ
[149] What are some best practices of using auto Layout? : r/FigmaDesign https://www.reddit.com/r/FigmaDesign/comments/17ltwe7/what_are_some_best_practices_of_using_auto_layout/
[150] Auto Layout in Figma: to use or not to use? - Rafal Tomal https://rafaltomal.com/auto-layout-figma/
[151] 10 Auto-Layout Tips in Figma - UX Collective https://uxdesign.cc/10-auto-layout-tips-in-figma-23f530c8098a
[152] Tips to master Figma auto layout? : r/userexperience - Reddit https://www.reddit.com/r/userexperience/comments/vfmn4k/tips_to_master_figma_auto_layout/
[153] Figma Design Best Practices (Auto Layouts, Components, & Tokens) https://www.youtube.com/watch?v=NcQneN8zt5I
[154] 10 Figma Shortcuts to Design Faster - Builder.io https://www.builder.io/blog/best-figma-shortcuts
[155] How to Design Faster in Figma — Tips, Autolayout, Tutorial - YouTube https://www.youtube.com/watch?v=cWptH9EJNuw
[156] Auto layout shortcuts - YouTube https://www.youtube.com/watch?v=wMzh2_dbDWM
[157] Auto layouts tutorial with real life design example - YouTube https://www.youtube.com/watch?v=DLXKxDpU73E
[158] Working with Auto Layout in Figma - a Self-Guided Tutorial https://www.figma.com/community/file/1207414800398401244/working-with-auto-layout-in-figma-a-self-guided-tutorial
[159] Figma Auto Layout: The Secret to Responsive Design https://designshack.net/articles/layouts/figma-auto-layout/
[160] Auto Layouts in Figma - imagy.app https://imagy.app/auto-layouts-in-figma/
[161] Master Figma Auto Layout with 3 Practical Examples in under 15 Mins https://www.youtube.com/watch?v=-VfOlYgfYC4
[162] How to Design UI Elements with Figma's Auto Layout (+ Examples) https://zerotomastery.io/blog/how-to-use-figma-auto-layout/
[163] How to create responsive cards with the help of auto-layout in Figma? https://uxdesign.cc/how-to-create-responsive-cards-with-the-help-of-auto-layout-in-figma-f7b2f3841d89
[164] Design Like a PRO with Auto Layout Nav Bars in Figma - YouTube https://www.youtube.com/watch?v=FSzl9KnvmeA
[165] Using auto-layout components in Figma - UX Collective https://uxdesign.cc/auto-layout-components-in-figma-110b170b9367
[166] How to Make Complex Components in Figma with Auto Layout ... https://www.youtube.com/watch?v=2xkjnY1t0xQ
[167] Responsive Navigation bar in Figma - How to Design auto layout ... https://www.youtube.com/watch?v=NWePUZJr9fM
[168] Figma Auto Layout: Practical tips for dynamic designs - Evil Martians https://evilmartians.com/chronicles/figma-auto-layout-practical-tips-for-dynamic-designs
[169] Making Complex UI Components in Figma - DEV Community https://dev.to/clickpesa/making-complex-ui-components-in-figma-44m9
[170] Design a card with me using Auto Layout - YouTube https://www.youtube.com/watch?v=n9TTEyCICco
[171] Designing a Navigation Bar in Figma (Step-by-Step Tutorial!) https://www.youtube.com/watch?v=m1saUv5dSJQ
