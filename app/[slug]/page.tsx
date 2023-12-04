import { DocumentRenderer } from "@keystatic/core/renderer"
import { reader } from "../reader"
import { notFound } from "next/navigation"
import Image from "next/image"

export default async function Post({ params }: { params: { slug: string } }) {
  const { slug } = params

  const post = await reader.collections.posts.read(slug)

  if (!post) notFound()

  const authors = await Promise.all(
    post.authors.map(async (authorSlug) => ({
      ...(await reader.collections.authors.read(authorSlug)),
      slug: authorSlug,
    }))
  )

  return (
    <div>
      <h1>{post.title}</h1>
      {/* <pre>{JSON.stringify(authors, null, 2)}</pre> */}
      <div>
        <DocumentRenderer document={await post.content()} />
      </div>
      {authors.length > 0 && (
        <>
          <h2>Written by</h2>
          <ul>
            {authors.map((author) => (
              <li key={author.slug}>
                <h3>{author.name}</h3>
                <Image
                  src={author.avatar || ""}
                  width={100}
                  height={100}
                  alt={`Avatar for ${author.name}`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export async function generateStaticParams() {
  const slugs = await reader.collections.posts.list()

  return slugs.map((slug) => ({
    slug,
  }))
}
