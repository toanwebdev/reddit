import { Box, Button, Flex, Spinner } from "@chakra-ui/react"
import { Form, Formik } from "formik"
import InputField from "../components/InputField"
import Layout from "../components/Layout"
import { useCheckAuth } from "../utils/useCheckAuth"
import NextLink from 'next/link'
import { CreatePostInput, useCreatePostMutation } from "../generated/graphql"
import { useRouter } from "next/router"

const CreatePost = () => {
  const router = useRouter()
  const { data: authData, loading: authLoading } = useCheckAuth()

  const initialValues = {title: '', text: ''}

  const [createPost] = useCreatePostMutation()

  const onCreatePostSubmit = async (values: CreatePostInput) => {
    await createPost({
      variables: {
        createPostInput: values
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            posts(existing) {
              if(data?.createPost.success && data.createPost.post) {
                // Post: new_id
                const newPostRef = cache.identify(data.createPost.post)

                return {
                  ...existing,
                  totalCount: existing.totalCount + 1,
                  paginatedPosts: [
                    {__ref: newPostRef},
                    ...existing.paginatedPosts
                  ]
                }
              }
            }
          }
        })
      }
    })
    router.push('/')
  }

  return (
    <>
      {authLoading || (!authLoading && !authData?.me) ? (
				<Flex justifyContent='center' alignItems='center' minHeight='100vh'>
					<Spinner />
				</Flex>
			):(
        <Layout>
          <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
						{({ isSubmitting }) => (
							<Form>
								<Box mt={4}>
									<InputField
										name='title'
										placeholder='Title'
										label='Title'
										type='text'
									/>
								</Box>
								<Box mt={4}>
									<InputField
                    textarea
										name='text'
										placeholder='Text'
										label='Text'
										type='textarea'
									/>
								</Box>

								<Flex justifyContent='space-between' alignItems='center' mt={4}>
                  <Button
                    type='submit'
                    colorScheme='teal'
                    isLoading={isSubmitting}>
                    Create Post
                  </Button>

                  <NextLink href='/'>
                    <Button
                      type='submit'
                      isLoading={isSubmitting}>
                      Go back to homepage
                    </Button>
                  </NextLink>
                </Flex>
							</Form>
						)}
					</Formik>
        </Layout>
      )
    }
    </>
  )
}

export default CreatePost
