class MostViewedProducts extends HTMLElement {
    constructor() {
        super();
        this.storeId = this.dataset.storeid;
        this.productId = this.dataset.productid;
        this.id = this.dataset.id;
        this.getProductsData();
    }

    async getProductsData() {
        try {
            const response = await fetch(
                `/apps/views-count-dev/mostviewedproducts?store=${this.storeId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch views count");
            }

            const data = await response.json();

            if (data.products) {
                this.displayProducts(data.products);
            }
        } catch (error) {
            console.error("Error fetching views count:", error);
        }
    }

    displayProducts(products) {
        const productGrid = this.querySelector("#mvpb-product-grid");
        (async () => {
            for (const product of products) {
                if (product.count && product.productHandle) {
                    const handle = product.productHandle;
                    const views = product.count;

                    const productUrl = `${window.Shopify.routes.root}products/${handle}.json`;

                    try {
                        const response = await fetch(productUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch product with handle: ${handle}`);
                        }

                        const productData = await response.json();
                        if (productData.product) {
                            const product = productData.product;
                            const { title, image, vendor, url } = product;

                            // Create the product grid element
                            const productElement = document.createElement("div");
                            productElement.classList.add("mvpb-product-item"); // Add a CSS class for styling

                            // Build the product content
                            productElement.innerHTML = `
                    <a href="/products/${handle}" class="mvpb-product-wrapper" aria-label="View Product">
                    <div class="mvpb-product-img-wrapper">
                      <img class="mvpb-product-img" src="${image.src}" alt="${title}">
                      </div>
                      <div class="mvpv-product-info">
                        <h4 class="mvpb-product-title">${title}</h4>
                        <span class="mvpb-product-brand">Brand: ${vendor}</span>
                        <span class="mvpb-product-views">Views: ${views}</span>
                      </div>
                    </a>
                  `;
                            // Append the product element to the grid
                            productGrid.appendChild(productElement);
                        } else {
                            console.error(`Error fetching product with handle: ${handle}`);
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                }
            }

            if (is_slider) {
                this.createSlider();
            }
        })();
    }
    createSlider() {
        const productGrid = this.querySelector("#mvpb-product-grid");
        const sliderWrapper = document.createElement("div");
        sliderWrapper.classList.add("mvpb-slider-wrapper");

        const prevButton = document.createElement("button");
        prevButton.innerText = "Prev";
        prevButton.classList.add("mvpb-slider-prev");

        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.classList.add("mvpb-slider-next");

        productGrid.parentNode.insertBefore(sliderWrapper, productGrid);
        sliderWrapper.appendChild(prevButton);
        sliderWrapper.appendChild(productGrid);
        sliderWrapper.appendChild(nextButton);

        const items = Array.from(productGrid.children);
        const totalItems = items.length;
        const slidesPerPage =
            typeof slides_per_page !== "undefined" ? slides_per_page : 4;
        let currentSlide = 0;

        // Apply initial styles to the product grid and items
        productGrid.style.display = "flex";
        productGrid.style.transition = "transform 0.5s ease";
        //   productGrid.style.overflow = 'hidden';

        items.forEach((item) => {
            item.style.flex = `0 0 calc(${100 / slidesPerPage}% - 20px )`;
            item.style.boxSizing = "border-box";
        });

        const updateSlider = () => {
            const offset = -currentSlide * (100 / slidesPerPage);
            productGrid.style.transform = `translateX(${offset}%)`;
        };

        prevButton.addEventListener("click", () => {
            currentSlide = Math.max(currentSlide - 1, 0);
            updateSlider();
        });

        nextButton.addEventListener("click", () => {
            currentSlide = Math.min(currentSlide + 1, totalItems - slidesPerPage);
            updateSlider();
        });

        updateSlider();
    }
}

customElements.define("most-viewed-products", MostViewedProducts);
