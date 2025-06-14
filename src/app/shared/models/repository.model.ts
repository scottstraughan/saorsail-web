/**
 * Represents a repository.
 */
export interface Repository {
  repo: {
    name: Record<string, string>
    description: string
    icon: Record<string, ImageReference>
    address: string
    mirrors: any // ignored
    webBaseUrl: string
    timestamp: number
    antiFeatures: any // ignored
    categories: Record<string, Category>
    releaseChannels: any // ignored
  }
  packages: Record<string, Application>
}

/**
 * Represents a repository category.
 */
export interface Category {
  id: string
  icon?: Record<string, ImageReference>
  name: Record<string, string>
}

/**
 * Represents a image.
 */
export interface ImageReference {
  name: string
  sha256: string
  size: number
}

/**
 * Represents an application.
 */
export interface Application {
  namespace: string
  metadata: {
    added: number
    categories: string[]
    changelog: string
    issueTracker: string
    lastUpdated: number
    license: string
    sourceCode: string
    screenshots: Record<string, Record<string, ImageReference>>
    authorName: string
    authorWebSite?: string
    icon?: Record<string, ImageReference>
    name: Record<string, string>
    summary: Record<string, string>
    description: Record<string, string>
    preferredSigner: string
  }
  versions: Record<string, ApplicationVersion>,
  stars?: number // Added
}

/**
 * Represents a package version.
 */
export interface ApplicationVersion {
  added: number
  file: {
    name: string
    sha256: string
    size: number
    ipfsCIDv1: string
  }
  src: {
    name: string
    sha256: string
    size: number
  }
  manifest: {
    nativecode: string[]
    versionName: string
    versionCode: number
    usesSdk: {
      minSdkVersion: number
      targetSdkVersion: number
    }
    signer: {
      sha256: string[]
    }
    usesPermission?: ApplicationDevicePermission[]
  }
  whatsNew?: Record<string, string>
}

/**
 * Represents a device permission.
 */
export interface ApplicationDevicePermission {
  name: string
}
