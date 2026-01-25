# Base image
FROM node:24-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK command line tools
RUN mkdir -p /usr/local/android-sdk/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/tools.zip && \
    unzip /tmp/tools.zip -d /usr/local/android-sdk/cmdline-tools && \
    mv /usr/local/android-sdk/cmdline-tools/cmdline-tools /usr/local/android-sdk/cmdline-tools/latest && \
    rm /tmp/tools.zip

# Android SDK environment
ENV ANDROID_HOME=/usr/local/android-sdk
ENV ANDROID_SDK_ROOT=/usr/local/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses and install SDK components
RUN yes | sdkmanager --sdk_root=${ANDROID_HOME} --licenses || true
RUN sdkmanager --sdk_root=${ANDROID_HOME} \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0"

# Set up app workspace
WORKDIR /app

# Copy dependency files first (Docker cache optimization)
COPY package*.json ./

# Install JS dependencies
RUN npm ci

# Copy the rest of the source
COPY . .

# Ensure gradlew is executable
RUN chmod +x android/gradlew

# Run tests → if they pass, build the AAB
CMD ["bash"]
